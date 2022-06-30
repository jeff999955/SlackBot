type Problem = any;

interface ProblemResponse {
    difficulty: Difficulty,
    numProblems: number,
    problems: any[]
}

type Difficulty = "easy" | "medium" | "hard";


