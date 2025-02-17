import { useState, useEffect } from "react";

const NEWS_JSON_PATH = "/data/news.json";

// TypeScript interface for a news article
interface NewsBlockProps {
  title: string;
  platform: string;
  date: string;
  description: string;
  link: string;
  thumbnail: string;
}

const NewsBlock: React.FC<NewsBlockProps> = ({ title, platform, date, description, link, thumbnail }) => {
  return (
    <a href={link} target="_blank" rel="noreferrer noopener" className="w-full h-auto flex flex-col md:flex-row justify-center md:items-start gap-4 p-4 border rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <img src={thumbnail} alt={title} className="h-32 w-auto object-cover rounded-lg" />
      <div className='flex flex-col gap-2 text-center md:text-left'>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-600">{description}</p>
      <p className="text-sm font-medium">{platform} - {date}</p>
      </div>
    </a>
  );
};

export default function News() {
  const [articles, setArticles] = useState<NewsBlockProps[]>([]);

  useEffect(() => {
    fetch(NEWS_JSON_PATH)
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch((err) => console.error("Error loading news:", err));
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center pt-32 pb-10 responsive-padding gap-10">
      <h1 className="text-3xl font-bold">News</h1>
      <div className="flex flex-col justify-center items-center gap-5 w-full max-w-3xl">
        {articles.length > 0 ? (
          articles.map((article) => <NewsBlock key={article.title} {...article} />)
        ) : (
          <p className="text-gray-500">Loading news...</p>
        )}
      </div>
    </div>
  );
}
