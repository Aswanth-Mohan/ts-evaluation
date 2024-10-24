//Data Transformation Pipeline
interface TransformerContext {
    timestamp: Date;
    environment: string;
    userId?: string;
    correlationId: string;
}

interface TransformResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    metadata: {
        transformTime: number;
        steps: string[];
    };
}

interface Transformer<TInput, TOutput> {
    name: string;
    transform(input: TInput, context: TransformerContext): Promise<TOutput>;
    validate?(output: TOutput): boolean | Promise<boolean>;
    rollback?(input: TInput, error: Error): Promise<void>;
}

interface Pipeline<TInput, TOutput> {
    addTransformer<TIntermediate>(
        transformer: Transformer<TInput, TIntermediate>
    ): Pipeline<TIntermediate, TOutput>;

    execute(
        input: TInput, 
        context?: Partial<TransformerContext>
    ): Promise<TransformResult<TOutput>>;

    onError(
        handler: (error: Error, context: TransformerContext) => void
    ): this;
}

class DataPipeline<TInput, TOutput> implements Pipeline<TInput, TOutput> {
    private transformers: Transformer<any, any>[] = [];
    private errorHandler?: (error: Error, context: TransformerContext) => void;

    addTransformer<TIntermediate>(
        transformer: Transformer<TInput, TIntermediate>
    ): Pipeline<TIntermediate, TOutput> {
        this.transformers.push(transformer);
        return this as any as Pipeline<TIntermediate, TOutput>;
    }

    onError(
        handler: (error: Error, context: TransformerContext) => void
    ): this {
        this.errorHandler = handler;
        return this;
    }

    async execute(
        input: TInput, 
        partialContext?: Partial<TransformerContext>
    ): Promise<TransformResult<TOutput>> {
        const startTime = Date.now();
        const steps: string[] = [];

        const context: TransformerContext = {
            timestamp: new Date(),
            environment: 'development',
            correlationId: crypto.randomUUID(),
            ...partialContext
        };

        let currentInput: any = input;

        try {
            for (const transformer of this.transformers) {
                const transformStart = Date.now();
                
                currentInput = await transformer.transform(currentInput, context);

                if (transformer.validate) {
                    const isValid = await transformer.validate(currentInput);
                    if (!isValid) {
                        throw new Error(`Validation failed for transformer: ${transformer.name}`);
                    }
                }

                steps.push(`${transformer.name} (${Date.now() - transformStart}ms)`);
            }

            return {
                success: true,
                data: currentInput as TOutput,
                metadata: {
                    transformTime: Date.now() - startTime,
                    steps
                }
            };
        } catch (error) {
            const typedError = error instanceof Error ? error : new Error(String(error));

            if (this.errorHandler) {
                this.errorHandler(typedError, context);
            }

            for (let i = this.transformers.length - 1; i >= 0; i--) {
                const transformer = this.transformers[i];
                if (transformer.rollback) {
                    try {
                        await transformer.rollback(currentInput, typedError);
                    } catch (rollbackError) {
                        console.error('Rollback failed:', rollbackError);
                    }
                }
            }

            return {
                success: false,
                error: typedError,
                metadata: {
                    transformTime: Date.now() - startTime,
                    steps
                }
            };
        }
    }
}

// Example usage:

interface UserData {
    id: number;
    name: string;
}

interface EnrichedUserData extends UserData {
    email: string;
}

interface FinalUserData extends EnrichedUserData {
    lastLoginDate: Date;
}

// Example transformers

const userEnricher: Transformer<UserData, EnrichedUserData> = {
    name: 'UserEnricher',
    async transform(input: UserData, context: TransformerContext): Promise<EnrichedUserData> {
        return {
            ...input,
            email: `${input.name.toLowerCase()}@example.com`
        };
    },
    async validate(output: EnrichedUserData): Promise<boolean> {
        return output.email.includes('@');
    }
};

const loginDateAdder: Transformer<EnrichedUserData, FinalUserData> = {
    name: 'LoginDateAdder',
    async transform(input: EnrichedUserData, context: TransformerContext): Promise<FinalUserData> {
        return {
            ...input,
            lastLoginDate: context.timestamp
        };
    }
};

// Using the pipeline

async function example() {
    const pipeline = new DataPipeline<UserData, FinalUserData>();

    pipeline
        .addTransformer(userEnricher)
        .addTransformer(loginDateAdder)
        .onError((error, context) => {
            console.error('Pipeline error:', error, 'Context:', context);
        });

    const result = await pipeline.execute(
        { id: 1, name: 'John' }, 
        { userId: 'user123' }
    );

    console.log('Transform result:', result);
}

example().catch(console.error);
