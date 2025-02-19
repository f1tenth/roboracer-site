import { useEffect, useState } from "react";
import { parse, Entry } from "@retorquere/bibtex-parser";

interface Publication {
  title: string;
  author: string;
  year: string;
  journal?: string;
  booktitle?: string;
  volume?: string;
  number?: string;
  pages?: string;
  publisher?: string;
  url?: string;
  eprint?: string;
  doi?: string;
}

export default function Research() {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    const bibtexUrl ="https://raw.githubusercontent.com/f1tenth/roborace_publications/main/pub.bibtex";

    fetch(bibtexUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.text();
      })
      .then((bibtexData) => {
        const parsedData = parse(bibtexData);

        if (!parsedData.entries || parsedData.entries.length === 0) {
          console.warn("noentries found");
        }

        const formattedPublications = parsedData.entries.map((entry: Entry) => {
          //format authors
          let authorString = "Unknown Author";
          let arxivId = entry.fields?.eprint ?? null;
          if (entry.fields?.author) {
            if (Array.isArray(entry.fields.author)) {
              const authorsArray = entry.fields.author.map((a) =>
                typeof a === "object" && a.firstName && a.lastName
                  ? `${a.firstName} ${a.lastName}`
                  : typeof a === "string"
                  ? a
                  : JSON.stringify(a)
              );

              //commas and & between authors?
              if (authorsArray.length > 1) {
                authorString =
                  authorsArray.slice(0, -1).join(", ") + ", " + authorsArray.slice(-1);
              } else if (authorsArray.length === 2) {
                authorString = authorsArray.join(" & ");
              } else {
                authorString = authorsArray[0];
              }
            } else {
              authorString = entry.fields.author;
            }

            //handle error where arxiv entries are accidentally put in journal field
            if (!arxivId && entry.fields?.journal?.match(/arXiv:\d{4}\.\d{5}/)) {
              arxivId = entry.fields.journal.match(/arXiv:(\d{4}\.\d{5})/)?.[1] ?? "";
            }
          }

          return {
            title: entry.fields?.title ?? "Unknown Title",
            author: authorString,
            year: entry.fields?.year ?? "Unknown Year",
            journal: entry.fields?.journal?.startsWith("arXiv preprint") ? undefined : entry.fields?.journal, //get rid of arxiv preprint in journal
            booktitle: entry.fields?.booktitle,
            volume: entry.fields?.booktitle ? undefined : entry.fields?.volume, //no volume for conferences
            number: entry.fields?.number,
            pages: entry.fields?.pages,
            publisher: Array.isArray(entry.fields?.publisher) ? entry.fields.publisher.join(", ") : entry.fields?.publisher,
            url: entry.fields?.doi ? `https://doi.org/${entry.fields.doi}` : entry.fields?.url,
            eprint: arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined,
            doi: entry.fields?.doi,
          };
        });

        setPublications(formattedPublications);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="flex flex-col py-32 gap-8 responsive-padding">
      <h1 className="text-3xl font-bold">Publications</h1>
      <ul className="flex flex-col gap-5">
        {publications.map((pub, index) => (
          <li key={index} className="flex flex-col gap-1 p-5 shadow-inner rounded-lg bg-white border border-gray-200">
            <h4>{pub.title}</h4>
            <p className="text-gray-600">By {pub.author}</p>
            <p>{pub.year}</p>

            {pub.journal && <div><p>{pub.journal}</p></div>}
            {pub.booktitle && <div><em>Conference: {pub.booktitle}</em></div>}
            {pub.volume && <div>Volume {pub.volume}</div>}
            {pub.publisher && <div>Publisher: {pub.publisher}</div>}

            {pub.eprint && (
              <div>
                <a href={pub.eprint} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  View on arXiv
                </a>
              </div>
            )}
            {pub.url && (
              <div>
                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  Publication Link
                </a>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
