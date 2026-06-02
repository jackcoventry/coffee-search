import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiErrorResponse } from '@/lib/apiErrorResponse';
import { getAllProducts } from '@/lib/getProducts';

z.config({ jitless: true });

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
});

function getOptionalSearchParam(searchParams: URLSearchParams, name: string) {
  return searchParams.get(name) ?? undefined;
}

export async function GET(req: Request) {
  const startedAt = Date.now();

  try {
    const { searchParams } = new URL(req.url);

    const parsed = QuerySchema.safeParse({
      limit: getOptionalSearchParam(searchParams, 'limit'),
      offset: getOptionalSearchParam(searchParams, 'offset'),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const products = await getAllProducts(parsed.data.limit, parsed.data.offset);

    return NextResponse.json({
      count: products.length,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      products,
    });
  } catch (err) {
    return apiErrorResponse(err, 500, {
      durationMs: Date.now() - startedAt,
      method: req.method,
      route: '/api/products',
    });
  }
}
