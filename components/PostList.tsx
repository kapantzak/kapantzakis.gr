import Link from "next/link";
import { formatPostDate, type Post } from "@/lib/posts";
import styles from "./PostList.module.css";

type Props = { posts: Post[]; label: string; headingLevel: 2 | 3 };

export function PostList({ posts, label, headingLevel }: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className={styles.list} aria-label={label}>
      {posts.map((post) => (
        <li
          key={post.kind === "local" ? post.slug : post.url}
          className={styles.item}
        >
          <time className={styles.date} dateTime={post.date}>
            {formatPostDate(post.date)}
          </time>
          <Heading className={styles.title}>
            {post.kind === "local" ? (
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            ) : (
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                {post.title}{" "}
                <span className={styles.source}>on {post.source}</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            )}
          </Heading>
          <p className={styles.summary}>{post.summary}</p>
        </li>
      ))}
    </ol>
  );
}
