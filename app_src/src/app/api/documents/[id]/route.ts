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

        
        
        
        
        
        
        
        

        
        

        
        

        return new NextResponse(document, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': 'inline', 
            },
        });

    } catch (error) {
        console.error('Error serving document:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
