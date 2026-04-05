import { db } from '@/db';
import { generatedContents } from '@/db/schema';
import { desc } from 'drizzle-orm';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  let items: any[] = [];
  try {
    if (db) {
       items = await db.select().from(generatedContents).orderBy(desc(generatedContents.createdAt));
    }
  } catch (err) {
    console.error("Fetch history err:", err);
  }

  // Next.js passes dates as objects but we need serializable data for Client Components
  const serializedItems = items.map(item => ({
    ...item,
    createdAt: item.createdAt?.toISOString() || null,
    updatedAt: item.updatedAt?.toISOString() || null,
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
       <div className="flex items-center justify-between bg-dark-text text-white p-8 rounded-3xl brutal-shadow">
          <div>
            <h1 className="text-4xl font-black mb-2">History Vault 🗄️</h1>
            <p className="opacity-80 font-medium">All your beautifully crafted AI contents.</p>
          </div>
       </div>

       <HistoryClient items={serializedItems} />
    </div>
  );
}
