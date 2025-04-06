import Image from "next/image";

const avatars: {
  alt: string;
  src: string;
}[] = [
  {
    alt: "User",
    src: "https://miro.medium.com/v2/resize:fill:176:176/1*lUfHEjTMqa3znXIJnXD9hQ.png",
  },
];

const TestimonialsSmall = ({ priority }: { priority?: boolean }) => {
  return (
    <div className="inline-flex items-center gap-3 bg-base-100 px-5 py-3 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] border border-base-content/10 transition-all hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] mx-auto">
      {/* Avatar */}
      <div className="avatar">
        <div className="w-10 h-10 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100">
          <Image
            src={avatars[0].src}
            alt={avatars[0].alt}
            priority={priority}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </div>

      {/* Testimonial Content */}
      <div className="flex flex-col">
        <p className="text-sm font-mono font-semibold text-base-content">
          "Better than my own"
        </p>
        <span className="text-xs font-mono text-base-content/70">
          Kevin Nokia (67K on Medium)
        </span>
      </div>
    </div>
  );
};

export default TestimonialsSmall;
