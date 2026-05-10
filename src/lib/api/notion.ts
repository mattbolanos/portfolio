import { Client, isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const COFFEE_TABLE_PAGE_SIZE = 25;

type NotionPageProperty = PageObjectResponse["properties"][string];

type CoffeeTableProperties = PageObjectResponse["properties"] & {
  Created?: Extract<NotionPageProperty, { type: "created_time" }>;
};

export type CoffeeTablePage = Omit<PageObjectResponse, "properties"> & {
  properties: CoffeeTableProperties;
};

export type CoffeeTableQueryResult =
  | {
      ok: true;
      hasMore: boolean;
      nextCursor: string | null;
      pages: CoffeeTablePage[];
      requestStatus?: {
        incompleteReason?: string;
        type: string;
      };
    }
  | {
      ok: false;
      error: string;
    };

let notionClient: Client | null = null;

function getNotionClient(): Client | null {
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    return null;
  }

  notionClient ??= new Client({ auth: notionApiKey });
  return notionClient;
}

export async function getCoffeeTablePages(): Promise<CoffeeTableQueryResult> {
  const notion = getNotionClient();
  const dataSourceId = process.env.NOTION_DB_ID;

  if (!notion || !dataSourceId) {
    return {
      error: "Missing NOTION_API_KEY or NOTION_DB_ID.",
      ok: false,
    };
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: COFFEE_TABLE_PAGE_SIZE,
      result_type: "page",
      sorts: [
        {
          direction: "descending",
          property: "Created",
        },
      ],
    });

    return {
      hasMore: response.has_more,
      nextCursor: response.next_cursor,
      ok: true,
      pages: response.results.filter(isFullPage) as CoffeeTablePage[],
      requestStatus: response.request_status
        ? {
            incompleteReason: response.request_status.incomplete_reason,
            type: response.request_status.type,
          }
        : undefined,
    };
  } catch {
    return {
      error: "Unable to load coffee table data from Notion.",
      ok: false,
    };
  }
}
