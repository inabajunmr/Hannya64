const base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function paddingCount(bytes) {
  if(bytes.length % 3 == 1) {
    return 2;
  } else if (bytes.length % 3 == 2) {
    return 1;
  }
  return 0;
}

function encode(bytes) {
  let padding = paddingCount(bytes)
  let b = new Uint8Array(bytes.length + padding);
  b.set(bytes)
  var result = ""
  for (i = 0; i < b.length; i += 3) {
    let a24 = b[i] << 16 | b[i + 1] << 8 | b[i + 2] // 3byte to 24bit int
    let a1 = a24 >> 18 & 0b111111; // 1st 6bit
    let a2 = a24 >> 12 & 0b111111; // 2nd 6bit
    let a3 = a24 >> 6 & 0b111111; // 3rd 6bit
    let a4 = a24 & 0b111111; // 4th 6bit
    result += base64chars.charAt(a1)
    result += base64chars.charAt(a2)
            if (i + 2 == b.length - 1) {
                if (padding <= 1) {
                    result += base64chars.charAt(a3);
                } else {
                    result += '=';
                }

                if (padding == 0) {
                    result += base64chars.charAt(a4);
                } else {
                    result += '=';
                }
            } else {
                result += base64chars.charAt(a3);
                result += base64chars.charAt(a4);
            }    
  }
  return result
}

function decode(encoded) {
    let result = []
    for (i = 0; i < encoded.length; i += 4) {
        let i1 = base64chars.indexOf(encoded.charAt(i))
        let i2 = base64chars.indexOf(encoded.charAt(i + 1))
        let b1 = i1 << 2 | i2 >> 4; // 11111122
        result.push(b1)
        let i3 = 0;
        if (encoded.charAt(i + 2) != '=') {
            i3 = base64chars.indexOf(encoded.charAt(i + 2));
            let b2 = i2 << 4 & 0b11110000 | i3 >> 2; // 22223333
            result.push(b2)
        }
        if (encoded.charAt(i + 3) != '=') {
            let i4 = base64chars.indexOf(encoded.charAt(i + 3));
            let b3 = i3 << 6 & 0b11000000 | i4; // 33444444
            result.push(b3)
        }
    }
    return new Uint8Array(result)
}

function encodeFromString(value) {
    const encoder = new TextEncoder()
    return encode(encoder.encode(value))
}

function decodeToString(encoded) {
    const decoded = decode(encoded)
    const decoder = new TextDecoder()
    return decoder.decode(decoded)
}
