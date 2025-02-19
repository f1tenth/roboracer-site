import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltFooter = currentPath === "/learn" || currentPath === "/build" || currentPath === "/course";

  return (
<footer
  className={`${isAltFooter ? "hidden" : ""} dotted-bg flex flex-col md:justify-between items-center text-white responsive-padding pt-6 gap-6 md:gap-12`}
>
  <div className='w-full flex text-center md:text-start justify-between flex-col md:flex-row items-end gap-6 md:gap-12'>
  {/* slack link */}
  <div className="flex flex-col items-start md:items-start gap-3 md:max-w-sm">
    <a
      href="https://robo-racer.slack.com/ssb/redirect"
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-row items-center gap-2 text-lg font-medium hover:underline"
    >
      <img src="/logos/slack-logo.svg" alt="Slack Logo" width={24} height={24} />
      <p>Join Our Community!</p>
    </a>
    <p className="text-gray-300 text-start">
      Join Slack to learn how to get started and get your questions answered.
    </p>
    <a href="mailto:contact@roboracer.ai" className="hover:text-gray-300">
    ✉ Contact Us
    </a>
  </div>

  {/* logo */}
  <div className="w-full flex justify-center md:justify-end">
    <img src="/logos/logo-white.svg" alt="RoboRacer Logo" width={200} height={50} />
  </div>

  </div>

  {/* license */}
  <div className="w-full text-xs text-center bg-black py-5">
    <p>Copyright ©2025 RoboRacer Foundation</p>
    <p>All rights reserved</p>
    <p>Creative Commons License</p>
  </div>
</footer>

  );
}
