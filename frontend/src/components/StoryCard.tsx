import { storyMedia, instagramUrl, type Story } from "@/lib/types";

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "blue" | "amber" | "purple" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function StoryCard({
  story,
  children,
}: {
  story: Story;
  children?: React.ReactNode;
}) {
  const { url, isVideo } = storyMedia(story);
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative aspect-[9/16] bg-gray-100">
        {url && isVideo ? (
          <video
            src={url}
            className="h-full w-full object-cover"
            muted
            playsInline
            // preload="none": don't fetch metadata for every video on page load
            // (the Library can show hundreds at once) — keeps the grid fast.
            preload="none"
            controls
          />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            no media
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-900">
            @{story.username ?? "unknown"}
          </span>
          <span className="text-xs text-gray-400">
            {story.posted_at ? new Date(story.posted_at).toLocaleDateString() : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {story.content_type === "post" && <Badge tone="blue">post</Badge>}
          {story.is_carousel && <Badge tone="purple">carrousel</Badge>}
          {story.category && <Badge>{story.category}</Badge>}
          {story.product && <Badge tone="blue">{story.product}</Badge>}
          {story.ad_built && <Badge tone="amber">ad built</Badge>}
          {story.exported_to_notion && <Badge tone="green">in Notion</Badge>}
        </div>

        {(story.overlay_text || story.caption) && (
          // stories: OCR overlay text; posts: the Instagram caption (full text on hover)
          <p
            className="line-clamp-3 text-xs text-gray-600"
            title={story.overlay_text ?? story.caption ?? undefined}
          >
            {story.overlay_text ?? story.caption}
          </p>
        )}

        {instagramUrl(story.short_code) && (
          <a
            href={instagramUrl(story.short_code)!}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-700 hover:underline"
            title={story.is_carousel ? "Open carrousel op Instagram (meerdere foto's)" : "Open op Instagram"}
          >
            {story.is_carousel ? "🖼️ bekijk carrousel ↗" : "bekijk op Instagram ↗"}
          </a>
        )}

        {children}
      </div>
    </div>
  );
}
