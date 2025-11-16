import clientPromise from "@/lib/mongodb";
import {NextRequest, NextResponse} from "next/server";
import {ProblemInput} from "@/types";
import {ObjectId} from "bson";

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		
		const client = await clientPromise;
		const db = client.db('fillblank');
		const collection = db.collection('problems');
		
		const body: ProblemInput = await request.json();
		const { text, answers, blanks } = body;
		
		await collection.updateOne(
			{ _id: new ObjectId(id) },
			{ $set: { text, answers, blanks, updatedAt: new Date() } }
		);
		
		return NextResponse.json({ success: true });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		
		const client = await clientPromise;
		const db = client.db('fillblank');
		const collection = db.collection('problems');
		
		await collection.deleteOne({ _id: new ObjectId(id) });
		
		return NextResponse.json({ success: true });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}