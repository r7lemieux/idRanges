"use strict";
require('../../../setup/initTests');
const BPromise = require('bluebird');
const id_service_1 = require('./id-service');
const httpMocks = require('node-mocks-http');
describe('id service', () => {
    it('put should increment a key value ', () => {
        let oldVal = 0;
        const response1 = httpMocks.createResponse();
        const response2 = httpMocks.createResponse();
        return id_service_1.idService.generateId('aaa2', response1)
            .then(() => {
            console.log(`=> id-service-spec:15 response1 ${JSON.stringify(response1)}`);
            console.log(`=> id-service-spec:15 response1_getData() ${JSON.stringify(response1._getData())}`);
            oldVal = response1._getData().nextId;
            expect(typeof oldVal).toBe('number');
            return id_service_1.idService.generateId('aaa2', response2);
        })
            .then(() => {
            const newVal = response2._getData().nextId;
            expect(newVal).toEqual(oldVal + 1);
            return BPromise.resolve();
        });
    });
});
//# sourceMappingURL=id-service-spec.js.map