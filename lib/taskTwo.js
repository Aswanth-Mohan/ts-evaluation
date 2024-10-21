"use strict";
// //Data Transformation Pipeline
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pipeline = () => {
    let updatedDataPipeline;
    const addTransformer = (transformer) => {
        return dataTransformationPipeline();
    };
    const execute = (input, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let transformerContext = {
                timestamp: new Date(),
                environment: 'developement',
                correlationId: '1234'
            };
            const transform = (input, context) => {
                let transformResult = {
                    success: transformerContext.environment === 'developement' ? true : false,
                    data: transformerContext,
                    metadata: {
                        transformTime: Date.now(),
                        steps: [transformerContext.environment]
                    }
                };
                updatedDataPipeline = transformResult;
                return transformResult;
            };
            const data = yield transform(input, transformerContext);
        }
        catch (error) {
            console.error(error);
        }
    });
    return updatedDataPipeline;
};
