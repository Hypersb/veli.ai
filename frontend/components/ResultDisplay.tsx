/**
 * Result Display Component
 * Shows the prediction result with appropriate styling and confidence score
 */

import React from 'react';
import { PredictionResponse } from '@/lib/api';

interface ResultDisplayProps {
  result: PredictionResponse;
}

export default function ResultDisplay({ result }: ResultDisplayProps) {
  const { prediction, confidence, message } = result;

  // Determine colors and icons based on prediction
  const getResultStyle = () => {
    switch (prediction) {
      case 'Safe':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          badgeBg: 'bg-green-100',
          badgeText: 'text-green-800',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'Spam':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          badgeBg: 'bg-orange-100',
          badgeText: 'text-orange-800',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'Phishing':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-800',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const style = getResultStyle();
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className={`${style.bgColor} ${style.borderColor} border-2 rounded-2xl p-8 animate-slide-up`}>
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`${style.badgeBg} ${style.badgeText} p-3 rounded-full flex-shrink-0`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-2xl font-bold ${style.textColor}`}>
              {prediction}
            </h3>
            <span className={`${style.badgeBg} ${style.badgeText} px-3 py-1 rounded-full text-sm font-semibold`}>
              {confidencePercent}% confident
            </span>
          </div>
          
          <p className={`${style.textColor} text-lg mb-4`}>
            {message}
          </p>

          {/* Confidence bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Confidence Score</span>
              <span className="font-semibold">{confidence.toFixed(4)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                  prediction === 'Safe' ? 'bg-green-500' :
                  prediction === 'Spam' ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
