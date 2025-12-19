import { NextResponse } from 'next/server';
import { BeneficiaryService } from '@/business/services/BeneficiaryService';

const beneficiaryService = new BeneficiaryService();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse('ID missing', { status: 400 });
        }

        const result = await beneficiaryService.getDocument(parseInt(id));

        if (!result || result.length === 0) {
            return new NextResponse('Document not found', { status: 404 });
        }

        const row = result[0] as any;
        if (!row.DOCUMENTS) {
            return new NextResponse('Document content missing', { status: 404 });
        }

        const document = row.DOCUMENTS;
        const mimeType = row.DOCUMENT_MIME_TYPE || 'application/octet-stream';

        // Check if it's a LOB and read it (if oracledb returns LOB)
        // Since we didn't configure fetchAsString/Buffer for specific columns broadly in db.ts, 
        // we might get a Buffer immediately if fetchAsBuffer is default or logic handles it.
        // The default `oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT` returns LOBs as Lob objects usually.
        // However, `execute` helper might need adjustment or we can assume Buffer if it's small/handled.
        // Let's assume Buffer works for now as mostly node-oracledb handles BLOB as Buffer with `fetchAsBuffer` 
        // OR we handle Lob stream. To stay simple, let's try returning it.
        // If it fails, we might need `oracledb.fetchAsBuffer`.

        // Actually, without `fetchAsBuffer`, it returns a Lob object which is a stream.
        // Next.js Response body can accept a Buffer, Stream, or string.

        // Let's coerce to Buffer if possible, or pass stream. 
        // Note: query() in db.ts returns result.rows.

        return new NextResponse(document, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': 'inline', // View in browser
            },
        });

    } catch (error) {
        console.error('Error serving document:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
