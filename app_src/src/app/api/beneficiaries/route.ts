import { NextResponse } from 'next/server';
import { BeneficiaryService } from '@/business/services/BeneficiaryService';

const beneficiaryService = new BeneficiaryService();

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const region = formData.get('region');
        const incomeRaw = formData.get('income');
        const familyMembersRaw = formData.get('familyMembers');
        const userIdRaw = formData.get('userId');

        if (!region || !incomeRaw || !familyMembersRaw || !userIdRaw) {
            return NextResponse.json(
                { error: 'Region, income, family members, and userId are required' },
                { status: 400 }
            );
        }

        const income = parseFloat(incomeRaw as string);
        const familyMembers = parseInt(familyMembersRaw as string);
        const userId = parseInt(userIdRaw as string);
        const requestedAmount = formData.get('requestedAmount') ? parseFloat(formData.get('requestedAmount') as string) : 0;

        if (isNaN(income) || isNaN(familyMembers) || isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid numeric values provided for income, family members, or user ID' },
                { status: 400 }
            );
        }

        const file = formData.get('document') as File | null;
        let documentBuffer = null;
        let mimeType = null;

        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            documentBuffer = Buffer.from(arrayBuffer);
            mimeType = file.type;
        }

        console.log(`Submitting application for User ${userId} with Income ${income}, Requested: ${requestedAmount}. Document: ${mimeType || 'None'}`);

        const result = await beneficiaryService.createBeneficiary(
            region as string,
            income,
            familyMembers,
            userId,
            documentBuffer,
            mimeType,
            requestedAmount
        );

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully for admin review',
            applicationId: result.lastRowid
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let beneficiaries;
        if (userId) {
            beneficiaries = await beneficiaryService.getBeneficiariesByUser(parseInt(userId));
        } else {
            beneficiaries = await beneficiaryService.getAllBeneficiaries();
        }

        return NextResponse.json({
            success: true,
            beneficiaries
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}
