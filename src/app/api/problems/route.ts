import {NextRequest, NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";
import {Problem} from "@/types";

export async function GET() {
	try {
		const client = await clientPromise;
		const db = client.db('fillblank');
		const collection = db.collection<Problem>('problems');
		
		const problems = await collection.find({}).toArray();
		return NextResponse.json(problems);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const client = await clientPromise;
		const db = client.db('fillblank');
		const collection = db.collection('problems');
		
		const body: ProblemInput = await request.json();
		const { text, answers, blanks } = body;
		
		const result = await collection.insertOne({
			text,
			answers,
			blanks,
			createdAt: new Date(),
		});
		
		return NextResponse.json(
			{
				_id: result.insertedId.toString(),
				text,
				answers,
				blanks
			},
			{ status: 201 }
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}