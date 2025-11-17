// src/app/page.tsx 수정
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, RotateCcw, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import {Problem} from "@/types";

const API_BASE = '/api';

export default function Home() {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
	const [showResult, setShowResult] = useState<boolean>(false);
	const [isEditing, setIsEditing] = useState<string | false>(false);
	const [editText, setEditText] = useState<string>('');
	const [editAnswers, setEditAnswers] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	
	useEffect(() => {
		loadProblems();
	}, []);
	
	// isEditing 상태 변경 감지
	useEffect(() => {
	}, [isEditing]);
	
	const loadProblems = async (): Promise<void> => {
		try {
			setLoading(true);
			const response = await fetch(`${API_BASE}/problems`);
			
			if (!response.ok) throw new Error('문제를 불러오는데 실패했습니다');
			const data: Problem[] = await response.json();
			
			setProblems(data);
			setError(null);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
			setError(errorMessage);
			console.error('❌ 로딩 실패:', err);
		} finally {
			setLoading(false);
		}
	};
	
	const handleAnswerChange = (blankIndex: number, value: string): void => {
		setUserAnswers({
			...userAnswers,
			[blankIndex]: value
		});
	};
	
	const checkAnswers = (): void => {
		setShowResult(true);
	};
	
	const resetAnswers = (): void => {
		setUserAnswers({});
		setShowResult(false);
	};
	
	const nextProblem = (): void => {
		if (currentIndex < problems.length - 1) {
			setCurrentIndex(currentIndex + 1);
			resetAnswers();
		}
	};
	
	const prevProblem = (): void => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			resetAnswers();
		}
	};
	
	const addProblem = (): void => {
		setEditText('');
		setEditAnswers(['']);
		setIsEditing('new');
	};
	
	const editProblem = (problem: Problem): void => {
		setEditText(problem.text);
		setEditAnswers([...problem.answers]);
		setIsEditing(problem._id);
	};
	
	const deleteProblem = async (id: string): Promise<void> => {
		if (!confirm('이 문제를 삭제하시겠습니까?')) return;
		
		try {
			const response = await fetch(`${API_BASE}/problems/${id}`, {
				method: 'DELETE',
			});
			if (!response.ok) throw new Error('삭제 실패');
			
			await loadProblems();
			if (currentIndex >= problems.length - 1) {
				setCurrentIndex(Math.max(0, problems.length - 2));
			}
			resetAnswers();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
			alert('삭제에 실패했습니다: ' + errorMessage);
		}
	};
	
	const saveProblem = async (): Promise<void> => {
		const blanksCount = (editText.match(/___/g) || []).length;
		const filteredAnswers = editAnswers.filter(a => a.trim() !== '');
		
		if (blanksCount === 0 || filteredAnswers.length === 0) {
			alert('문장에 ___ 형태의 빈칸과 정답을 입력해주세요!');
			return;
		}
		
		if (blanksCount !== filteredAnswers.length) {
			alert(`빈칸 개수(${blanksCount})와 정답 개수(${filteredAnswers.length})가 일치해야 합니다!`);
			return;
		}
		
		try {
			const problemData = {
				text: editText,
				answers: filteredAnswers,
				blanks: blanksCount
			};
			
			const url = isEditing === 'new'
				? `${API_BASE}/problems`
				: `${API_BASE}/problems/${isEditing}`;
			
			const method = isEditing === 'new' ? 'POST' : 'PUT';
			
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(problemData),
			});
			
			if (!response.ok) throw new Error('저장 실패');
			
			await loadProblems();
			setIsEditing(false);
			resetAnswers();
			
			if (isEditing === 'new') {
				setCurrentIndex(problems.length);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
			alert('저장에 실패했습니다: ' + errorMessage);
		}
	};
	
	const renderProblemText = (problem: Problem): React.ReactNode => {
		const parts = problem.text.split('___');
		return parts.map((part, index) => (
			<React.Fragment key={index}>
				{part}
				{index < parts.length - 1 && (
					<input
						type="text"
						value={userAnswers[index] || ''}
						onChange={(e) => handleAnswerChange(index, e.target.value)}
						disabled={showResult}
						className={`inline-block mx-1 px-3 py-1 border-b-2 min-w-[120px] text-center focus:outline-none transition-colors ${
							showResult
								? userAnswers[index]?.trim().toLowerCase() === problem.answers[index].toLowerCase()
									? 'border-green-500 bg-green-50'
									: 'border-red-500 bg-red-50'
								: 'border-gray-300 focus:border-blue-500'
						}`}
						placeholder="답 입력"
					/>
				)}
			</React.Fragment>
		));
	};
	
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
					<Loader2 className="animate-spin text-blue-500" size={48} />
					<p className="text-gray-600">로딩 중...</p>
				</div>
			</div>
		);
	}
	
	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<X className="text-red-500 mx-auto mb-4" size={48} />
					<h2 className="text-2xl font-bold text-gray-800 mb-2">오류 발생</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={loadProblems}
						className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
					>
						다시 시도
					</button>
				</div>
			</div>
		);
	}
	
	if (isEditing) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
				<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
					<h2 className="text-2xl font-bold text-gray-800 mb-6">
						{isEditing === 'new' ? '새 문제 추가' : '문제 수정'}
					</h2>
					
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							문제 문장 (빈칸은 ___ 로 표시)
						</label>
						<textarea
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
							placeholder="예: The capital of France is ___."
						/>
					</div>
					
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							정답 ({editAnswers.length}개)
						</label>
						{editAnswers.map((answer, index) => (
							<div key={index} className="flex gap-2 mb-2">
								<input
									type="text"
									value={answer}
									onChange={(e) => {
										const newAnswers = [...editAnswers];
										newAnswers[index] = e.target.value;
										setEditAnswers(newAnswers);
									}}
									className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={`정답 ${index + 1}`}
								/>
								{editAnswers.length > 1 && (
									<button
										onClick={() => setEditAnswers(editAnswers.filter((_, i) => i !== index))}
										className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
									>
										<Trash2 size={20} />
									</button>
								)}
							</div>
						))}
						<button
							onClick={() => setEditAnswers([...editAnswers, ''])}
							className="text-blue-500 hover:text-blue-600 text-sm font-medium mt-2"
						>
							+ 정답 추가
						</button>
					</div>
					
					<div className="flex gap-3">
						<button
							onClick={saveProblem}
							className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
						>
							저장
						</button>
						<button
							onClick={() => setIsEditing(false)}
							className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
						>
							취소
						</button>
					</div>
				</div>
			</div>
		);
	}
	
	if (problems.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<h2 className="text-2xl font-bold text-gray-800 mb-4">문제가 없습니다</h2>
					<button
						onClick={() => {
							addProblem();
						}}
						className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
					>
						<Plus size={20} />
						첫 문제 추가하기
					</button>
				</div>
			</div>
		);
	}
	
	const currentProblem = problems[currentIndex];
	const allCorrect = showResult &&
		currentProblem.answers.every((answer, index) =>
			userAnswers[index]?.trim().toLowerCase() === answer.toLowerCase()
		);
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="max-w-3xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-4">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-2xl md:text-3xl font-bold text-gray-800">
							네트워크 2차 수행 빈칸 채우기 학습
						</h1>
						<button
							onClick={() => {
								// addProblem();
							}}
							className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
						>
							<Plus size={20} />
						</button>
					</div>
					
					<div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">
              문제 {currentIndex + 1} / {problems.length}
            </span>
						<div className="flex gap-2">
							<button
								// onClick={() => editProblem(currentProblem)}
								className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<Edit2 size={18} />
							</button>
							<button
								// onClick={() => deleteProblem(currentProblem._id)}
								className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				</div>
				
				<div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-4">
					<div className="text-lg md:text-xl leading-relaxed text-gray-800 mb-6">
						{renderProblemText(currentProblem)}
					</div>
					
					{showResult && (
						<div className={`p-4 rounded-lg mb-6 ${
							allCorrect ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
						}`}>
							<div className="flex items-center gap-2 mb-2">
								{allCorrect ? (
									<>
										<Check className="text-green-600" size={24} />
										<span className="font-bold text-green-800">정답입니다! 🎉</span>
									</>
								) : (
									<>
										<X className="text-yellow-600" size={24} />
										<span className="font-bold text-yellow-800">다시 확인해보세요</span>
									</>
								)}
							</div>
							<div className="text-sm text-gray-700">
								<span className="font-medium">정답: </span>
								{currentProblem.answers.join(', ')}
							</div>
						</div>
					)}
					
					<div className="flex flex-col sm:flex-row gap-3">
						{!showResult ? (
							<button
								onClick={checkAnswers}
								className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
							>
								<Check size={20} />
								정답 확인
							</button>
						) : (
							<button
								onClick={resetAnswers}
								className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
							>
								<RotateCcw size={20} />
								다시 풀기
							</button>
						)}
					</div>
				</div>
				
				<div className="flex gap-3">
					<button
						onClick={prevProblem}
						disabled={currentIndex === 0}
						className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
					>
						← 이전
					</button>
					<button
						onClick={nextProblem}
						disabled={currentIndex === problems.length - 1}
						className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
					>
						다음 →
					</button>
				</div>
			</div>
		</div>
	);
}