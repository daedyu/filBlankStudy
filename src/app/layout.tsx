import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: '빈칸 채우기 학습',
	description: '빈칸을 채우며 공부하는 웹 앱',
};

export default function RootLayout({
  children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ko">
		<body>{children}</body>
		</html>
	);
}