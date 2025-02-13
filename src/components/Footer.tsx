import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isAltFooter = currentPath === "/learn" || currentPath === "/build" || currentPath === "/course";

  return (
    <footer className={`${isAltFooter ? "hidden" : ""} dotted-bg flex flex-col gap-8 text-white p-4`}>
      <a href="https://robo-racer.slack.com/ssb/redirect" target="_blank" rel="noreferrer noopener" className='flex flex-row justify-start gap-2'>
        <img src='/logos/slack-logo.svg' alt='Slack Logo' width={20} height={20}/>
        <p>Join Our Community!</p>
      </a>
      <p>Join slack to learn how to get started and get your questions answered</p>
      <img src='/logos/logo-white.svg' alt='RoboRacer Logo' width={200} height={50}/>
    </footer>
  );
}
