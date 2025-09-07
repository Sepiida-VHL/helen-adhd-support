# RSD Integration Guide for Helen AI

## Understanding the RSD Spiral

ADHD individuals experience Rejection Sensitive Dysphoria (RSD) as a cascading mental process:

1. **Mistake** → "I forgot to..."
2. **Self-Judgment** → "That was stupid"  
3. **Generalization** → "I always do this"
4. **Identity Attack** → "Why am I such a failure?"
5. **Worthlessness** → "I'm worthless, that's why I make mistakes"

This spiral can happen in seconds and feels like physical pain.

## How Helen Interrupts the Spiral

### 1. Pattern Recognition
The system detects which stage the user is in by analyzing their language:
- Stage 1: "I messed up", "I forgot", "I should have"
- Stage 2: "I'm so dumb", "what an idiot", "that was pathetic"
- Stage 3: "I always", "I never", "typical me"
- Stage 4: "I'm a failure", "I'm broken", "what's wrong with me"
- Stage 5: "I'm worthless", "I don't matter", "what's the point"

### 2. Motivational Interviewing Response
For each stage, Helen uses specific MI techniques:

#### Stage 1 - Mistake (Normalize)
- "I hear that something didn't go as planned. That sounds frustrating. Can you tell me more?"
- Normalizes ADHD executive function challenges
- Focuses on the event, not the person

#### Stage 2 - Self-Judgment (Reflection)
- "I notice you're being really hard on yourself. What would you say to a friend who made the same mistake?"
- Reflects the harsh self-talk without reinforcing it
- Introduces perspective shift

#### Stage 3 - Generalization (Evidence Questioning)
- "I hear you saying this 'always' happens. Can you think of even one time when things went differently?"
- Gently challenges absolute thinking
- Invites curiosity about exceptions

#### Stage 4 - Identity Attack (Reframe)
- "I'm noticing a single event is making you question your entire worth. What if we separate what happened from who you are?"
- Creates distance between actions and identity
- Validates the feeling while questioning the conclusion

#### Stage 5 - Worthlessness (Affirmation)
- "I can hear how much pain you're in. Your worth isn't determined by your mistakes."
- Prioritizes safety and stabilization
- Offers immediate grounding

## Implementation in Code

### 1. In geminiService.ts
```typescript
import { 
  processRSDAwareMessage, 
  getRSDAwareSystemInstruction,
  enhanceResponseWithRSDInterventions,
  generateRSDValidation 
} from './rsdAwareGeminiConfig';

// In your response generation function:
const { rsdAnalysis, enhancedPrompt, shouldPrioritizeRSD } = 
  processRSDAwareMessage(messages, previousActivity);

// Add RSD context to system instruction
const systemInstruction = getRSDAwareSystemInstruction(
  baseSystemInstruction, 
  previousActivity
);

// If RSD detected, add the enhanced prompt
if (enhancedPrompt) {
  systemInstruction += enhancedPrompt;
}

// After getting AI response, enhance with RSD interventions
const enhancedResponse = enhanceResponseWithRSDInterventions(
  baseResponse, 
  rsdAnalysis
);

// Add RSD-specific validation
if (rsdAnalysis.stage) {
  enhancedResponse.adhdValidation = generateRSDValidation(
    rsdAnalysis.stage, 
    rsdAnalysis.severity
  );
}
```

### 2. Key Principles for AI Responses

The system prompt now includes:
- Recognition of RSD patterns early
- Use of MI techniques (not fixing or convincing)
- Never dismissing or minimizing feelings
- Reflective listening: "It sounds like you're feeling..."
- Open questions: "What would it be like if...?"
- Affirmations of strengths and efforts
- Separation of actions from identity

### 3. Natural Integration

The AI is instructed to:
- Not make it obvious it's following a script
- Integrate MI techniques naturally
- Ask maximum one question per response
- Use "I notice..." or "It sounds like..." language
- Maintain genuine warmth and curiosity

## Example Conversations

### Example 1: Self-Judgment Stage
**User:** "I forgot my friend's birthday again. I'm such a terrible friend."

**Helen:** "I notice you're being really hard on yourself about forgetting. That must feel awful, especially because I can tell how much you care about your friend. It sounds like your inner critic is being pretty loud right now. 

What would you say to a friend who forgot a birthday? I bet you'd be much kinder to them than you're being to yourself right now.

*[ADHD brains process mistakes more intensely - that's neurological, not a character flaw.]*"

### Example 2: Identity Attack Stage
**User:** "Why am I such a failure? I can't do anything right."

**Helen:** "I'm hearing that a difficult moment is making you question your entire worth as a person. That must feel absolutely overwhelming. 

Can we take a breath together and separate what happened from who you are? You're not defined by this one situation, even though RSD is making it feel that way right now.

*[You are not your ADHD struggles. You're a whole person dealing with a challenging brain.]*"

## Interventions Offered

Based on RSD stage, Helen suggests appropriate interventions:
- **Early stages (1-2):** Catching the Narrative, breathing exercises
- **Middle stages (3-4):** Self-Compassion Break, emotional distancing
- **Crisis stage (5):** Temperature grounding, immediate safety

## Success Metrics

- Early interruption of spiral (catching at stages 1-2)
- Gentle questioning of absolute statements
- User able to separate actions from identity
- Reduced severity over time
- Increased self-compassion language

## Remember

The goal isn't to "fix" or convince users their thoughts are wrong. It's to:
1. Create space for self-compassion
2. Interrupt the automatic spiral
3. Invite curiosity about alternatives
4. Validate feelings while questioning narratives
5. Remind them their worth isn't determined by mistakes

This approach treats RSD as the neurological reality it is, not a character flaw or something to overcome through willpower.
