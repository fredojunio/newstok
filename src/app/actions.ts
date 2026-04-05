'use server'

import { db } from '@/db';
import { generatedContents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function saveGeneratedContent(data: {
  url: string;
  modelUsed: string;
  selectedVersion: number;
  hook: string;
  bridge: string;
  value: string;
  cta: string;
  style: string;
}) {
  try {
    if (!db) {
        throw new Error("Database not initialized. Check your DATABASE_URL.");
    }
    const fullContent = `${data.hook}\n\n${data.bridge}\n\n${data.value}\n\n${data.cta}`;
    
    await db.insert(generatedContents).values({
      url: data.url,
      modelUsed: data.modelUsed,
      selectedVersion: data.selectedVersion,
      hook: data.hook,
      bridge: data.bridge,
      value: data.value,
      cta: data.cta,
      fullContent,
      style: data.style,
    });
    
    revalidatePath('/history');
    return { success: true };
  } catch (err: any) {
    console.error("Failed to save content", err);
    return { success: false, error: err.message };
  }
}

export async function deleteGeneratedContent(id: string) {
  try {
    if (!db) return { success: false, error: 'Secondary Database not initialized.' };
    await db.delete(generatedContents).where(eq(generatedContents.id, id));
    revalidatePath('/history');
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete content", err);
    return { success: false, error: err.message };
  }
}

export async function editGeneratedContent(id: string, newContent: string) {
  try {
    if (!db) return { success: false, error: 'DB not initialized.' };
    await db.update(generatedContents)
      .set({ fullContent: newContent, updatedAt: new Date() })
      .where(eq(generatedContents.id, id));
    revalidatePath('/history');
    return { success: true };
  } catch (err: any) {
    console.error("Failed to edit content", err);
    return { success: false, error: err.message };
  }
}
