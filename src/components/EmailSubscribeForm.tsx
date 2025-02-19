import { useState } from "react";

export default function EmailSubscribeForm() {
  const [email, setEmail] = useState("");

  return (
      <form
        action="https://f1tenth.us13.list-manage.com/subscribe/post?u=a91a25f4c1fbc0c9896af9a20&amp;id=b5caf3bccb&amp;f_id=00e64fe9f0"
        method="post"
        target="_blank"
        className="w-full flex flex-col items-center"
      >
        <div className="w-full">

          <input
            type="email"
            name="EMAIL"
            id="mce-EMAIL"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div className="hidden">
          <input type="text" name="b_a91a25f4c1fbc0c9896af9a20_b5caf3bccb" tabIndex={-1} />
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-[#00D1DA] text-white font-medium py-2 rounded-md hover:bg-blue-700 transition duration-300"
        >
          Subscribe to the RoboRacer mailing list
        </button>
      </form>
  );
}
