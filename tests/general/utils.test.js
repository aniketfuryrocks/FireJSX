"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const LinkTools_1 = require("firejsx/utils/LinkTools");
test('ConvertPathToUrl', () => {
    expect(LinkTools_1.convertPathToUrl('/hello/myname/index?asd=asd&t=asd/index'))
        .toBe('/hello/myname');
});
test('rmIndexSuffixFromPath', () => {
    expect(LinkTools_1.rmIndexSuffixFromPath('/home/index')).toBe('/home');
});
