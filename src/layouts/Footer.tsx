import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#07152B] border border-[#1b2b47] rounded-xl px-8 py-8 mt-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Section */}
        <p className="text-sm text-gray-300 text-center md:text-left">
          © {new Date().getFullYear()} Code Snippet, Inc. All rights reserved.
        </p>

        {/* Right Section */}
        <div className="flex items-center gap-6 text-gray-300">
          <a
            href="#"
            className="hover:text-white transition-colors duration-200"
          >
            <FaFacebook size={22} />
          </a>

          <a
            href="#"
            className="hover:text-white transition-colors duration-200"
          >
            <FaInstagram size={22} />
          </a>

          <a
            href="#"
            className="hover:text-white transition-colors duration-200"
          >
            <FaXTwitter size={20} />
          </a>

          <a
            href="#"
            className="hover:text-white transition-colors duration-200"
          >
            <FaGithub size={22} />
          </a>

          <a
            href="#"
            className="hover:text-white transition-colors duration-200"
          >
            <FaYoutube size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
