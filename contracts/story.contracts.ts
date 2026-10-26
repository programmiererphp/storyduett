// StoryDuett contracts V1; use runtime validation in backend (TypeScript types alone insufficient).
export type ChoiceTone = 'serious' | 'ironic';
export type CommentKind = 'ironic' | 'neutral' | 'correction' | 'coaching';
export interface ChoiceV1 { id: string; text: string; tone: ChoiceTone; }
export interface QuestionV1 { id: string; text: string; options: [ChoiceV1,ChoiceV1,ChoiceV1]; }
export interface AnswerSubmitV1 { questionId: string; selectedOptionId?: string; customAnswer?: string; idempotencyKey: string; }
export interface StorySegmentV1 { id: string; turnId: string; text: string; kind: 'opening'|'user-contribution'|'ai-bridge'; actorId: string; }
export interface StoryCommentV1 { kind: CommentKind; text: string; }
export interface StoryNodeV1 { id: string; sessionId: string; parentNodeId: string|null; playerId: string|null; rawAnswer: string|null; selectedOptionId: string|null; appendedSegments: StorySegmentV1[]; comment: StoryCommentV1|null; nextQuestion: QuestionV1; promptVersionIds: Record<'start'|'question'|'comment'|'integrate',string>; createdAt: string; }
export interface TurnGenerationV1 { comment: StoryCommentV1; appendedSegments: Array<Pick<StorySegmentV1,'text'|'kind'|'actorId'>>; nextQuestion: QuestionV1; }
export interface UseCaseV1 { id:string; name:string; version:number; enabled:boolean; language:string; presentation:'prose'|'language'|'learning'; textModel:string; tts:{model:string;voiceId:string;style:string;speed:number}; prompts: Record<'start'|'question'|'comment'|'integrate',string>; }
export interface ApiUsageV1 { requestId:string; sessionId:string|null; userId:string|null; feature:'start'|'turn'|'tts'|'cartoon'|'chat'|'summary'; model:string; promptVersionIds:string[]; inputTokens:number|null; outputTokens:number|null; thinkingTokens:number|null; cachedTokens:number|null; audioTokens:number|null; estimatedCostUsd:number|null; priceListVersion:string; status:'success'|'error'|'blocked'; errorCode?:string; startedAt:string; latencyMs:number; }
