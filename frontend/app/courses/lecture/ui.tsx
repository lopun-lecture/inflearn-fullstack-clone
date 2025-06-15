"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  CourseDetailDto,
  LectureActivity as LectureActivityEntity,
  Lecture as LectureEntity,
  Section as SectionEntity,
  UpdateLectureActivityDto,
} from "@/generated/openapi-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircle2,
  LockIcon,
  PlayCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon,
  ListIcon,
  XIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api";

/*****************
 * Helper Utils  *
 *****************/
function formatSecondsToMinSec(seconds: number | undefined) {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

/*****************
 * Sub Components *
 *****************/
function LectureRow({
  lecture,
  isActive,
  onSelect,
  completed = false,
}: {
  lecture: LectureEntity;
  isActive: boolean;
  onSelect: () => void;
  completed?: boolean;
}) {
  return (
    <div
      onClick={lecture.videoStorageInfo ? onSelect : undefined}
      className={cn(
        "flex items-center justify-between text-sm px-4 py-2 cursor-pointer",
        isActive && "bg-primary/10 text-primary font-semibold",
        !isActive && "hover:bg-muted/50",
        lecture.videoStorageInfo ? "" : "cursor-default opacity-60"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        {completed ? (
          <CheckCircle2 className="size-4 text-green-500 shrink-0" />
        ) : lecture.isPreview ? (
          <PlayCircleIcon className="size-4 text-primary shrink-0" />
        ) : (
          <LockIcon className="size-4 text-muted-foreground shrink-0" />
        )}
        <span className="truncate">{lecture.title}</span>
      </div>
      <span className="shrink-0 pl-2 text-muted-foreground">
        {formatSecondsToMinSec(lecture.duration)}
      </span>
    </div>
  );
}

function Sidebar({
  sections,
  currentLectureId,
  onSelectLecture,
  course,
  onClose,
}: {
  sections: SectionEntity[];
  currentLectureId?: string;
  onSelectLecture: (lecture: LectureEntity) => void;
  course: CourseDetailDto;
  onClose: () => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-80 h-screen bg-white border-l shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-bold text-lg flex-1">커리큘럼</p>
        <button
          className="p-1 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <h2 className="text-h2 text-lg font-semibold p-4" title={course.title}>
        {course.title}
      </h2>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" className="w-full">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="flex text-sm font-medium px-4 py-3 bg-muted/50 hover:no-underline">
                <span className="flex-1 text-left truncate">
                  {section.title}
                </span>
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {section.lectures.length}개
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-background">
                <div className="flex flex-col">
                  {section.lectures
                    .sort((a, b) => a.order - b.order)
                    .map((lecture) => (
                      <LectureRow
                        key={lecture.id}
                        lecture={lecture}
                        isActive={lecture.id === currentLectureId}
                        onSelect={() => onSelectLecture(lecture)}
                        completed={false /* TODO: replace with real progress */}
                      />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </aside>
  );
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const _p = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${_p(h)}:${_p(m)}:${_p(s)}` : `${_p(m)}:${_p(s)}`;
}

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-black text-white">
      Loading player...
    </div>
  ),
});

function VideoPlayer({
  lecture,
  lectureActivity,
}: {
  lecture: LectureEntity;
  lectureActivity?: LectureActivityEntity;
}) {
  const router = useRouter();
  const updateLectureActivityMutation = useMutation({
    mutationFn: (updateLectureActivityDto: UpdateLectureActivityDto) =>
      api.updateLectureActivity(lecture.id, updateLectureActivityDto),
    onSuccess: (result) => {
      console.log("Update Lecture Activity Success");
      console.log(result);
    },
  });

  const videoUrl = (lecture.videoStorageInfo as any)?.cloudFront?.url as
    | string
    | undefined;

  const playerRef = React.useRef<any>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const hasSeekOnReadyRef = React.useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0); // fraction 0~1
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    hasSeekOnReadyRef.current = false;
    setPlayed(0);
    setPlayedSeconds(0);
  }, [lecture.id]);

  const handlePlayPause = () => {
    setPlaying((p) => !p);
    updateLectureActivityMutation.mutate({
      duration: playedSeconds,
      isCompleted: played >= 0.95,
      lastWatchedAt: new Date().toISOString(),
      progress: Math.round(played * 100),
    });
  };

  const handleMute = () => {
    setMuted((m) => !m);
  };

  const handleVolumeChange = (values: number[]) => {
    const v = values[0] / 100;
    setVolume(v);
    setMuted(v === 0);
  };

  const handleSeekChange = (values: number[]) => {
    setPlayed(values[0] / 100);
  };

  const handleSeekCommit = (values: number[]) => {
    const fraction = values[0] / 100;
    playerRef.current?.seekTo(fraction, "fraction");
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) setPlayed(state.played);
    setPlayedSeconds(Math.floor(state.playedSeconds));
    updateLectureActivityMutation.mutate({
      duration: playedSeconds,
      isCompleted: played >= 0.95,
      lastWatchedAt: new Date().toISOString(),
      progress: Math.round(played * 100),
    });
  };

  const handleEnded = () => {
    updateLectureActivityMutation.mutate({
      duration: Math.round(totalDuration),
      isCompleted: true,
      lastWatchedAt: new Date().toISOString(),
      progress: 100,
    });
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapperRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center w-full aspect-video bg-black text-white">
        영상이 준비되지 않았습니다.
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 h-full bg-black">
      {/* ReactPlayer maintains 16:9 responsiveness by padding */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        playing={playing}
        muted={muted}
        volume={volume}
        width="100%"
        height="100%"
        style={{ backgroundColor: "black" }}
        onProgress={handleProgress}
        onDuration={setTotalDuration}
        onEnded={handleEnded}
        playbackRate={playbackRate}
        onReady={() => {
          if (lectureActivity && !hasSeekOnReadyRef.current) {
            hasSeekOnReadyRef.current = true;
            playerRef.current?.seekTo(lectureActivity.duration, "seconds");
          }
        }}
      />

      {/* Lecture title overlay */}
      <div className="absolute top-2 left-2 flex items-center">
        <button className="cursor-pointer" onClick={() => router.back()}>
          <ArrowLeftIcon color="white" size={20} />
        </button>
        <span className="text-sm md:text-base font-semibold text-white bg-black/60 px-3 py-1 rounded-md">
          {lecture.title}
        </span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 bg-black/70 backdrop-blur flex flex-col gap-2 text-white">
        {/* progress slider */}
        <Slider
          min={0}
          max={100}
          value={[played * 100]}
          onValueChange={(v) => {
            setSeeking(true);
            handleSeekChange(v);
          }}
          onValueCommit={(v) => {
            handleSeekCommit(v);
            setSeeking(false);
          }}
        />
        {/* bottom control bar */}
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            {/* play/pause */}
            <button onClick={handlePlayPause} aria-label="play-pause">
              {playing ? (
                <PauseIcon className="size-4" />
              ) : (
                <PlayIcon className="size-4" />
              )}
            </button>

            {/* time */}
            <span className="tabular-nums text-xs">
              {formatTime(played * totalDuration)} / {formatTime(totalDuration)}
            </span>

            {/* volume */}
            <button onClick={handleMute} aria-label="mute">
              {muted || volume === 0 ? (
                <VolumeXIcon className="size-4" />
              ) : (
                <Volume2Icon className="size-4" />
              )}
            </button>
            <Slider
              className="w-24"
              min={0}
              max={100}
              value={[muted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* speed select */}
            <Select
              value={playbackRate.toString()}
              onValueChange={(v) => setPlaybackRate(parseFloat(v))}
            >
              <SelectTrigger className="w-16 h-8 bg-black/20 border border-white/20 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-white/20">
                {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                  <SelectItem key={r} value={r.toString()} className="text-xs">
                    {r}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* fullscreen */}
            <button onClick={toggleFullscreen} aria-label="fullscreen">
              {isFullscreen ? (
                <MinimizeIcon className="size-4" />
              ) : (
                <MaximizeIcon className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LectureHeader({
  title,
  sections,
  currentLectureIndex,
}: {
  title: string;
  sections: SectionEntity[];
  currentLectureIndex: number;
}) {
  // Mock progress: pretend 37% complete
  const totalLectures = useMemo(
    () => sections.reduce((acc, s) => acc + s.lectures.length, 0),
    [sections]
  );
  const completedLectures = Math.floor(totalLectures * 0.37);
  const progressValue = (completedLectures / totalLectures) * 100;

  return (
    <header className="space-y-2 mb-4">
      <h1 className="text-lg font-semibold truncate" title={title}>
        {title}
      </h1>
      <Progress value={progressValue} />
      <p className="text-xs text-muted-foreground">
        {completedLectures} / {totalLectures} 강의 완료 · 현재{" "}
        {currentLectureIndex + 1}
        번째 강의
      </p>
    </header>
  );
}

/*****************
 * Main Component *
 *****************/
export default function UI({
  course,
  lectureId,
  lectureActivities,
}: {
  course: CourseDetailDto;
  lectureId?: string;
  lectureActivities: LectureActivityEntity[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLectureId = lectureId ?? course.sections[0].lectures[0].id;

  const allLectures = useMemo(() => {
    return course.sections.flatMap((section) => section.lectures);
  }, [course.sections]);

  const currentLecture = useMemo(() => {
    if (currentLectureId) {
      const found = allLectures.find((l) => l.id === currentLectureId);
      if (found) return found;
    }
    // fallback to first lecture
    return allLectures[0];
  }, [currentLectureId, allLectures]);

  const handleSelectLecture = (lecture: LectureEntity) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("courseId", course.id);
    params.set("lectureId", lecture.id);
    router.push(`/courses/lecture?${params.toString()}`);
  };

  const currentLectureIndex = allLectures.findIndex(
    (l) => l.id === currentLecture.id
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex w-screen absolute top-0 left-1/2 -translate-x-1/2 h-screen bg-black">
      {/* Video area */}
      <div className="flex-1 relative">
        <VideoPlayer
          lecture={currentLecture}
          lectureActivity={lectureActivities.find(
            (activity) => activity.lectureId === currentLectureId
          )}
        />

        {/* Floating button to open sidebar when closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow"
            aria-label="Open curriculum"
          >
            <ListIcon className="size-5" />
          </button>
        )}
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          sections={course.sections}
          currentLectureId={currentLecture.id}
          onSelectLecture={handleSelectLecture}
          course={course}
          onClose={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
