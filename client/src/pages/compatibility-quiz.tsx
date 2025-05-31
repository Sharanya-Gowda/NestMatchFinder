import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const questions = [
  {
    id: 'foodType',
    question: 'What are your food preferences?',
    options: [
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'non-vegetarian', label: 'Non-Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'any', label: 'No Preference' }
    ]
  },
  {
    id: 'sleepSchedule',
    question: 'What is your sleep schedule?',
    options: [
      { value: 'early-bird', label: 'Early Bird (Sleep by 10 PM)' },
      { value: 'night-owl', label: 'Night Owl (Sleep after 12 AM)' },
      { value: 'flexible', label: 'Flexible' }
    ]
  },
  {
    id: 'studyHabits',
    question: 'How do you prefer to study/work?',
    options: [
      { value: 'quiet', label: 'Complete Silence' },
      { value: 'music', label: 'With Background Music' },
      { value: 'collaborative', label: 'With Others' },
      { value: 'flexible', label: 'Adaptable' }
    ]
  },
  {
    id: 'cleanliness',
    question: 'How important is cleanliness to you?',
    options: [
      { value: 'high', label: 'Very Important' },
      { value: 'medium', label: 'Moderately Important' },
      { value: 'low', label: 'Not Very Important' }
    ]
  },
  {
    id: 'socialLevel',
    question: 'How social are you?',
    options: [
      { value: 'very-social', label: 'Very Social (Love hanging out)' },
      { value: 'moderate', label: 'Moderately Social' },
      { value: 'private', label: 'Prefer Privacy' }
    ]
  },
  {
    id: 'smoking',
    question: 'Do you smoke?',
    options: [
      { value: 'yes', label: 'Yes, regularly' },
      { value: 'occasional', label: 'Occasionally' },
      { value: 'no', label: 'No, never' }
    ]
  },
  {
    id: 'drinking',
    question: 'Do you drink alcohol?',
    options: [
      { value: 'yes', label: 'Yes, regularly' },
      { value: 'social', label: 'Only socially' },
      { value: 'no', label: 'No, never' }
    ]
  },
  {
    id: 'pets',
    question: 'How do you feel about pets?',
    options: [
      { value: 'love', label: 'Love pets' },
      { value: 'neutral', label: 'Neutral/Okay with pets' },
      { value: 'allergic', label: 'Allergic/Prefer no pets' }
    ]
  }
];

export default function CompatibilityQuiz() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    // Save preferences to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(answers));
    setIsComplete(true);
    
    toast({
      title: "Preferences Saved!",
      description: "Your roommate preferences have been updated. You'll now see compatibility scores.",
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQuestionData = questions[currentQuestion];
  const hasAnswered = answers[currentQuestionData?.id];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">All Set!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your preferences have been saved. You'll now see compatibility scores when browsing properties.
            </p>
            <Button onClick={() => setLocation('/dashboard/user')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard/user')}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Roommate Compatibility
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Help us find your perfect roommate match
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestionData.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestionData.id] || ""}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestionData.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!hasAnswered}
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
            {currentQuestion < questions.length - 1 && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Question indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index < currentQuestion
                  ? 'bg-green-500'
                  : index === currentQuestion
                  ? 'bg-primary'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}