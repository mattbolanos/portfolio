import { z } from "zod";

export const GithubRepoSchema = z.object({
  pushed_at: z.iso.datetime({ offset: true }),
});

const GithubContributionDaySchema = z.object({
  contributionCount: z.number().int().nonnegative(),
  date: z.iso.date(),
});

const GithubContributionWeekSchema = z.object({
  contributionDays: z.array(GithubContributionDaySchema),
});

export const GithubContributionsQuerySchema = z.object({
  data: z.object({
    user: z
      .object({
        contributionsCollection: z.object({
          contributionCalendar: z.object({
            weeks: z.array(GithubContributionWeekSchema),
          }),
        }),
      })
      .nullable(),
  }),
  errors: z
    .array(
      z.object({
        message: z.string(),
      }),
    )
    .optional(),
});

const GithubRepositoryRefSchema = z.object({
  nameWithOwner: z.string(),
});

const GithubContributionTimestampSchema = z.object({
  occurredAt: z.iso.datetime({ offset: true }),
});

const GithubCommitContributionTimestampSchema = z.object({
  commitCount: z.number().int().nonnegative(),
  occurredAt: z.iso.datetime({ offset: true }),
});

const GithubRepoCommitContributionSchema = z.object({
  contributions: z.object({
    nodes: z.array(GithubCommitContributionTimestampSchema),
  }),
  repository: GithubRepositoryRefSchema,
});

const GithubRepoTimedContributionSchema = z.object({
  contributions: z.object({
    nodes: z.array(GithubContributionTimestampSchema),
  }),
  repository: GithubRepositoryRefSchema,
});

export const GithubRepoContributionsQuerySchema = z.object({
  data: z.object({
    viewer: z.object({
      contributionsCollection: z.object({
        commitContributionsByRepository: z.array(
          GithubRepoCommitContributionSchema,
        ),
        issueContributionsByRepository: z.array(
          GithubRepoTimedContributionSchema,
        ),
        pullRequestContributionsByRepository: z.array(
          GithubRepoTimedContributionSchema,
        ),
        pullRequestReviewContributionsByRepository: z.array(
          GithubRepoTimedContributionSchema,
        ),
      }),
    }),
  }),
  errors: z
    .array(
      z.object({
        message: z.string(),
      }),
    )
    .optional(),
});
