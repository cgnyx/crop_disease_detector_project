// 'use server';
/**
 * @fileOverview Handles cases with low confidence in disease detection, offering alternative suggestions or guiding the user to capture a clearer image.
 *
 * - reasonAboutLowConfidence - A function that handles the reasoning process for low confidence disease detections.
 * - ReasonAboutLowConfidenceInput - The input type for the reasonAboutLowConfidence function.
 * - ReasonAboutLowConfidenceOutput - The return type for the reasonAboutLowConfidence function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutLowConfidenceInputSchema = z.object({
  diseaseName: z.string().describe('The name of the initially detected disease.'),
  confidence: z.number().describe('The confidence level of the disease detection (0-1).'),
  imageDescription: z.string().describe('A description of the image taken by the user.'),
  cropType: z.string().describe('The type of crop that the image was taken from.'),
});
export type ReasonAboutLowConfidenceInput = z.infer<typeof ReasonAboutLowConfidenceInputSchema>;

const ReasonAboutLowConfidenceOutputSchema = z.object({
  suggestion: z.string().describe('An alternative disease suggestion or guidance for capturing a clearer image.'),
});
export type ReasonAboutLowConfidenceOutput = z.infer<typeof ReasonAboutLowConfidenceOutputSchema>;

export async function reasonAboutLowConfidence(input: ReasonAboutLowConfidenceInput): Promise<ReasonAboutLowConfidenceOutput> {
  return reasonAboutLowConfidenceFlow(input);
}

const reasonAboutLowConfidencePrompt = ai.definePrompt({
  name: 'reasonAboutLowConfidencePrompt',
  input: {schema: ReasonAboutLowConfidenceInputSchema},
  output: {schema: ReasonAboutLowConfidenceOutputSchema},
  prompt: `You are an AI assistant that helps farmers diagnose crop diseases based on image analysis.
  The farmer has taken a picture of their crop, but the confidence level of the disease detection is low.
  Your task is to:
  1.  If the confidence is very low (less than 0.3), guide the farmer to capture a clearer image by providing specific instructions based on the image description.
  2.  If the confidence is moderate (between 0.3 and 0.6), suggest alternative diseases that might be affecting the crop, based on the initially detected disease and crop type.
  3.  If the confidence is relatively high (above 0.6), acknowledge the result is still somewhat uncertain, but provide additional information that might help the farmer seek further assistance.

  Here are the details of the image analysis:
  - Disease Name: {{{diseaseName}}}
  - Confidence Level: {{{confidence}}}
  - Image Description: {{{imageDescription}}}
  - Crop Type: {{{cropType}}}

  Provide a concise and helpful suggestion to the farmer.
  `,
});

const reasonAboutLowConfidenceFlow = ai.defineFlow(
  {
    name: 'reasonAboutLowConfidenceFlow',
    inputSchema: ReasonAboutLowConfidenceInputSchema,
    outputSchema: ReasonAboutLowConfidenceOutputSchema,
  },
  async input => {
    const {output} = await reasonAboutLowConfidencePrompt(input);
    return output!;
  }
);
