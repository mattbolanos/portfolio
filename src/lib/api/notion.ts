import {
  Client,
  isFullPage,
  type QueryDataSourceResponse,
} from "@notionhq/client";

const NOTION_CACHE_REVALIDATE_SECONDS = 24 * 60 * 60;
const NOTION_QUERY_PAGE_SIZE = 100;

let notionClient: Client | null = null;

const getNotionClient = (): Client | null => {
  const notionApiKey = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    return null;
  }

  notionClient ??= new Client({ auth: notionApiKey });
  return notionClient;
};

export type CoffeeQueryResult = Pick<
  QueryDataSourceResponse,
  "has_more" | "next_cursor" | "object" | "results" | "type"
>;

export async function getCoffeePages(): Promise<CoffeeQueryResult | null> {
  const notion = getNotionClient();
  const dataSourceId = process.env.NOTION_DB_ID;

  if (!notion || !dataSourceId) {
    return null;
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: NOTION_QUERY_PAGE_SIZE,
      sorts: [
        {
          direction: "descending",
          property: "Created",
        },
      ],
    });

    return {
      has_more: response.has_more,
      next_cursor: response.next_cursor,
      object: response.object,
      results: response.results.filter(isFullPage),
      type: response.type,
    };
  } catch {
    return null;
  }
}

export { NOTION_CACHE_REVALIDATE_SECONDS };
