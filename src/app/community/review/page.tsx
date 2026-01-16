"use client";

import React, { Suspense } from 'react'; 
import ReviewContent from '../../../components/community/ReviewContent'

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ReviewContent />
    </Suspense>
  );
}