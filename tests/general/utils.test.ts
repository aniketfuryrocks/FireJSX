import {convertPathToUrl, rmIndexSuffixFromPath} from "firejsx/utils/LinkTools";

test('ConvertPathToUrl', () => {
    expect(convertPathToUrl('/hello/myname/index?asd=asd&t=asd/index'))
        .toBe('/hello/myname');
});

test('rmIndexSuffixFromPath', () => {
    expect(rmIndexSuffixFromPath('/home/index')).toBe('/home')
});