import * as romajiHiraganaObj from 'src/assets/romaji-hiragana.json';
import * as romajiKatakanaObj from 'src/assets/romaji-katakana.json';
import { DecoderTrie } from './decoderTrie';

describe('decoder trie', () => {
    const romajiHiragana = Object.keys(romajiHiraganaObj)
        .map(i => romajiHiraganaObj[Number(i)])
        .filter(x => Boolean(x));
    
    let hiraganaTrie = new DecoderTrie(romajiHiragana);

    it('should decode correct things correctly', () => {
        for (const pair of romajiHiragana){
            const [key, value] = pair;
            expect(hiraganaTrie.decode(key) === value).toBe(true);
        }
    });

    it("should decode 'axkazozkkalonna n a' as 'あxかぞzっかlおんな ん あ'", () => {
        console.log('### test start');
        expect(hiraganaTrie.decode('axkazozkkalonna n a', '### ')).toBe('あxかぞzっかlおんな ん あ');
    })
});