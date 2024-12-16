import JSZip from 'jszip';

export class Base64Converter {
    /**
     * Encodes a given string to Base64 format with optional URI encoding and optional zipping.
     * @param input The string to encode.
     * @param useUriEncoding Whether to encode the string using encodeURIComponent and unescape (default: true).
     * @param useZip Whether to zip the string before Base64 encoding (default: false).
     * @returns The Base64-encoded string.
     */
    public static async ToBase64Async(input: string, useUriEncoding: boolean = true, useZip: boolean = false): Promise<string> {
        let stringToEncode = input;

        // Optionally encode the string with URI encoding 
        if (useUriEncoding) {
            stringToEncode = encodeURIComponent(input);
        }

        // Optionally zip the string
        if (useZip) {
            const zip = new JSZip();
            zip.file("data.txt", stringToEncode);
            const zipContent = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 9 } });
            stringToEncode = String.fromCharCode(...zipContent);
        }

        // Base64 encode the string
        return btoa(stringToEncode);
    }

    /**
     * Decodes a Base64-encoded string back to its original format with optional URI decoding and unzipping.
     * @param input The Base64-encoded string.
     * @param useUriEncoding Whether to decode the string using decodeURIComponent and escape (default: true).
     * @param useZip Whether to unzip the string after decoding (default: false).
     * @returns The decoded string.
     */
    public static async FromBase64Async(input: string, useUriEncoding: boolean = true, useZip: boolean = false): Promise<string> {
        let decodedString = atob(input);

        // Optionally unzip the string
        if (useZip) {
            const zip = await JSZip.loadAsync(decodedString);
            const file = zip.file("data.txt");
            if (file) {
                decodedString = await file.async("text");
            }
        }

        // Optionally decode the string with URI decoding 
        if (useUriEncoding) {
            decodedString = decodeURIComponent(decodedString);
        }

        return decodedString;
    }

}
