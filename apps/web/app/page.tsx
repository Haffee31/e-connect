"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";

interface IMessage {
	id: number;
	text: string;
	sent: boolean;
	timestamp: Date;
}

function MessageContent({
	text,
	timestamp,
}: {
	text: string;
	timestamp: Date;
}) {
	const [expanded, setExpanded] = useState(false);
	const [showReadMore, setShowReadMore] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (contentRef.current) {
			const lineHeight = parseInt(
				getComputedStyle(contentRef.current).lineHeight
			);
			const maxHeight = lineHeight * 5;
			setShowReadMore(contentRef.current.scrollHeight > maxHeight);
		}
	}, [text]);

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};

	return (
		<div>
			<div
				ref={contentRef}
				className={`overflow-hidden transition-all duration-300 ease-in-out ${
					expanded ? "max-h-full" : "max-h-[7.5em]"
				}`}
			>
				{text}
			</div>
			<div className="flex justify-between items-center mt-1">
				{showReadMore && (
					<Button
						variant="link"
						className="p-0 h-auto font-normal text-default"
						onClick={() => setExpanded(!expanded)}
					>
						{expanded ? (
							<>
								Read less <ChevronUp className="h-3 w-3 ml-1" />
							</>
						) : (
							<>
								Read more{" "}
								<ChevronDown className="h-3 w-3 ml-1" />
							</>
						)}
					</Button>
				)}
				<span className="text-xs text-muted-foreground ml-auto">
					{formatTime(timestamp)}
				</span>
			</div>
		</div>
	);
}

export default function ChatRoom() {
	const { messages, sendMessage } = useSocket();

	const [inputMessage, setInputMessage] = useState("");
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const lastMessageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = () => {
		if (inputMessage.trim()) {
			sendMessage({
				id: messages.length + 1,
				text: inputMessage.trim(),
				sent: true,
				timestamp: new Date(),
			});
			setInputMessage("");
		}
	};

	return (
		<div className="flex flex-col h-screen max-w-md mx-auto border rounded-lg overflow-hidden">
			<div className="bg-primary text-primary-foreground p-4 flex items-center justify-center italic">
				<h1 className="text-xl font-bold">E-Connect</h1>
			</div>

			<ScrollArea className="flex-grow relative" ref={scrollAreaRef}>
				<div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none" />
				<div className="p-4 space-y-4">
					{messages.map((message, index) => (
						<div
							key={message.id}
							className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
							ref={
								index === messages.length - 1
									? lastMessageRef
									: null
							}
						>
							<div
								className={`relative max-w-[70%] p-3 rounded-lg ${
									message.sent
										? "bg-primary text-primary-foreground rounded-tr-none"
										: "bg-secondary text-secondary-foreground rounded-tl-none"
								}`}
							>
								<MessageContent
									text={message.text}
									timestamp={message.timestamp}
								/>
								<div
									className={`absolute top-0 w-4 h-4 ${
										message.sent
											? "-right-2 bg-primary"
											: "-left-2 bg-secondary"
									}`}
									style={{
										clipPath: message.sent
											? "polygon(0 0, 0% 100%, 100% 0)"
											: "polygon(100% 0, 0 0, 100% 100%)",
									}}
								/>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>
			<div className="p-4">
				<div className="flex space-x-4">
					<Input
						type="text"
						placeholder="Type a message..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleSendMessage();
							}
						}}
						className="h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-md"
					/>
					<Button
						onClick={handleSendMessage}
						className="h-12 w-12 bg-primary text-white rounded-md flex items-center justify-center hover:bg-primary-dark"
					>
						<Send className="h-6 w-6" />
						<span className="sr-only">Send message</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
