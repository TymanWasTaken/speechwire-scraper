export interface Notification {
	title: string;
	priority: NotificationPriority;
	tags?: string[];
	message: string;
	click?: string;
}

export enum NotificationPriority {
	Min = 1,
	Low = 2,
	Default = 3,
	High = 4,
	Max = 5,
}

export async function sendNotification(topic: string, data: Notification) {
	await fetch("https://ntfy.sh", {
		method: "POST",
		body: JSON.stringify({
			topic,
			...data,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});
}
