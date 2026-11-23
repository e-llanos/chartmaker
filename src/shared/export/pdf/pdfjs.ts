type Pdfjs = typeof import('pdfjs-dist');
let promise: Promise<Pdfjs> | null = null;

/** Carga pdf.js una sola vez y configura su worker. */
export function loadPdfjs(): Promise<Pdfjs> {
    promise ??= import('pdfjs-dist').then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        return lib;
    });
    return promise;
}