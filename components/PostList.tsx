import { formatPostDate, type Post } from "@/lib/posts";
import styles from "./PostList.module.css";

type Props = { posts: Post[]; label: string };

// Every post lives on another site and opens in a new tab (decision 34).
export function PostList({ posts, label }: Props) {
  return (
    <ol className={styles.grid} aria-label={label}>
      {posts.map((post) => (
        <li key={post.url} className={styles.cell}>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.tile}
          >
            <span className={styles.meta}>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span className={styles.source}>{post.source}</span>
            </span>
            <h3 className={styles.title}>{post.title}</h3>
            <p className={styles.summary}>{post.summary}</p>
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ol>
  );
}
