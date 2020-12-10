class Hannya64 {
    base64chars
    padding
    constructor(chars, padding) {
        if (chars.length != 64) {
            throw new Error("Chars 64 length text.")
        }
        if (padding.length != 1) {
            throw new Error("Padding requires single letter.")
        }
        this.base64chars = chars
        this.padding = padding
    }

    encode(bytes) {
        const padding = this.paddingCount(bytes)
        const b = new Uint8Array(bytes.length + padding);
        b.set(bytes)
        let result = ""
        for (let i = 0; i < b.length; i += 3) {
            // 3byte to 24bit int(111111112222222233333333)
            const a24 = b[i] << 16 | b[i + 1] << 8 | b[i + 2]
            const a1 = a24 >> 18 & 0b111111; // 1st 6bit 111111
            const a2 = a24 >> 12 & 0b111111; // 2nd 6bit 112222
            const a3 = a24 >> 6 & 0b111111; // 3rd 6bit 222233
            const a4 = a24 & 0b111111; // 4th 6bit 333333

            // assemble encoded string
            result += this.base64chars.charAt(a1)
            result += this.base64chars.charAt(a2)
            if (i + 2 == b.length - 1) {
                if (padding <= 1) {
                    result += this.base64chars.charAt(a3);
                } else {
                    result += this.padding;
                }
                if (padding == 0) {
                    result += this.base64chars.charAt(a4);
                } else {
                    result += this.padding;
                }
            } else {
                result += this.base64chars.charAt(a3);
                result += this.base64chars.charAt(a4);
            }
        }
        return result
    }

    decode(encoded) {
        let result = []
        // 4chars(6bit) to 24byte(111111222222333333444444)
        for (let i = 0; i < encoded.length; i += 4) {
            const i1 = this.base64chars.indexOf(encoded.charAt(i))
            const i2 = this.base64chars.indexOf(encoded.charAt(i + 1))
            const b1 = i1 << 2 | i2 >> 4; // 11111122
            result.push(b1)
            let i3 = 0;
            if (encoded.charAt(i + 2) != this.padding) {
                i3 = this.base64chars.indexOf(encoded.charAt(i + 2));
                const b2 = i2 << 4 & 0b11110000 | i3 >> 2; // 22223333
                result.push(b2)
            }
            if (encoded.charAt(i + 3) != this.padding) {
                const i4 = this.base64chars.indexOf(encoded.charAt(i + 3));
                const b3 = i3 << 6 & 0b11000000 | i4; // 33444444
                result.push(b3)
            }
        }
        return new Uint8Array(result)
    }


    encodeFromString(value) {
        const encoder = new TextEncoder()
        return this.encode(encoder.encode(value))
    }

    decodeToString(encoded) {
        const decoded = this.decode(encoded)
        const decoder = new TextDecoder()
        return decoder.decode(decoded)
    }

    paddingCount(bytes) {
        if (bytes.length % 3 == 1) {
            return 2;
        } else if (bytes.length % 3 == 2) {
            return 1;
        }
        return 0;
    }
}
