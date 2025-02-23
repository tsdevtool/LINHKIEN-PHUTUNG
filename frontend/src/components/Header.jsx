import {
  Clock2,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

const Header = () => {
  return (
    <header className="bg-black text-white dark:bg-cyan-600/80 text-sm py-2 px-8 flex justify-between items-center rounded-2xl">
      {/* Thong tin lien he */}
      <div className="flex justify-center w-3/4 gap-4">
        <div className="flex gap-1">
          <MapPin />
          <p className="hover:text-cyan-400">
            34/7 Hẻm 1, Đường 1A, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM
          </p>
        </div>
        <div className="flex gap-1">
          <Mail />
          <p className="hover:text-cyan-400">admin@motorking.com</p>
        </div>
        <div className="flex gap-1">
          <Phone />
          <p className="hover:text-cyan-400">1900 0204</p>
        </div>
        <div className="flex gap-1">
          <Clock2 />
          Thứ 2 - Chủ Nhật: 8.00 am - 6.00 pm
        </div>
      </div>
      <div className="flex gap-3">
        <a href="#" className="hover:text-cyan-400">
          <Facebook />
        </a>
        <a href="#" className="hover:text-cyan-400">
          <Instagram />
        </a>
        <a href="#" className="hover:text-cyan-400">
          <Youtube />
        </a>
      </div>
    </header>
  );
};

export default Header;
