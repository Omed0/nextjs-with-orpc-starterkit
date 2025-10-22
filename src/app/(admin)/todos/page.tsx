"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
	EmptyDescription,
} from "@/components/ui/empty";
import { orpc } from "@/lib/orpc";

// Todo Item Component
interface TodoItemProps {
	todo: {
		id: number;
		text: string;
		completed: boolean;
	};
	onToggle: (id: number, completed: boolean) => void;
	onDelete: (id: number) => void;
	isLoading: boolean;
}

function TodoItem({ todo, onToggle, onDelete, isLoading }: TodoItemProps) {
	return (
		<div className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
			<div className="flex items-center gap-3 flex-1">
				<Checkbox
					checked={todo.completed}
					onCheckedChange={() => onToggle(todo.id, todo.completed)}
					id={`todo-${todo.id}`}
					disabled={isLoading}
					className="h-5 w-5"
				/>
				<label
					htmlFor={`todo-${todo.id}`}
					className={`flex-1 text-sm font-medium cursor-pointer select-none transition-all ${
						todo.completed
							? "text-muted-foreground line-through"
							: "text-foreground"
					}`}
				>
					{todo.text}
				</label>
			</div>
			<Button
				variant="ghost"
				size="icon"
				disabled={isLoading}
				onClick={() => onDelete(todo.id)}
				aria-label="Delete todo"
				className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
			>
				<Trash2 className="h-4 w-4" />
			</Button>
		</div>
	);
}

// Todo List Component
interface TodoListProps {
	todos: Array<{
		id: number;
		text: string;
		completed: boolean;
	}>;
	onToggle: (id: number, completed: boolean) => void;
	onDelete: (id: number) => void;
	isLoading: boolean;
}

function TodoList({ todos, onToggle, onDelete, isLoading }: TodoListProps) {
	if (todos.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No todos yet</EmptyTitle>
					<EmptyDescription>
						Create your first task to get started
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	const completedCount = todos.filter((t) => t.completed).length;
	const totalCount = todos.length;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">
					{totalCount} Task{totalCount !== 1 ? "s" : ""}
				</h2>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<CheckCircle2 className="h-4 w-4" />
					<span>
						{completedCount} of {totalCount} completed
					</span>
				</div>
			</div>
			<div className="space-y-2 max-h-[500px] overflow-y-auto rounded-md border p-2">
				{todos.map((todo) => (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={onToggle}
						onDelete={onDelete}
						isLoading={isLoading}
					/>
				))}
			</div>
		</div>
	);
}

// Add Todo Form Component
interface AddTodoFormProps {
	onSuccess: () => void;
}

function AddTodoForm({ onSuccess }: AddTodoFormProps) {
	const [newTodoText, setNewTodoText] = useState("");

	const createMutation = useMutation(
		orpc.todo.create.mutationOptions({
			onSuccess: () => {
				onSuccess();
				setNewTodoText("");
			},
		})
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newTodoText.trim()) {
			createMutation.mutate({ text: newTodoText.trim() });
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Add New Task</CardTitle>
				<CardDescription>
					Create a new todo item to track your tasks
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<Field>
						<FieldLabel htmlFor="todo-text">Task Description</FieldLabel>
						<Input
							id="todo-text"
							value={newTodoText}
							onChange={(e) => setNewTodoText(e.target.value)}
							placeholder="What needs to be done?"
							disabled={createMutation.isPending}
							required
						/>
					</Field>
					<Button
						type="submit"
						disabled={createMutation.isPending || !newTodoText.trim()}
						className="w-full"
					>
						{createMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							"Add Task"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

// Main Todo Manager Component
export default function TodosPage() {
	const todos = useQuery(orpc.todo.getAll.queryOptions());

	const toggleMutation = useMutation(
		orpc.todo.toggle.mutationOptions({
			onSuccess: () => {
				todos.refetch();
			},
		})
	);

	const deleteMutation = useMutation(
		orpc.todo.delete.mutationOptions({
			onSuccess: () => {
				todos.refetch();
			},
		})
	);

	const handleToggleTodo = (id: number, completed: boolean) => {
		toggleMutation.mutate({ id, completed: !completed });
	};

	const handleDeleteTodo = (id: number) => {
		deleteMutation.mutate({ id });
	};

	const handleAddSuccess = () => {
		todos.refetch();
	};

	const isLoading = toggleMutation.isPending || deleteMutation.isPending;

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
					<p className="text-muted-foreground">
						Manage your tasks efficiently with PostgreSQL database
					</p>
				</div>

				<AddTodoForm onSuccess={handleAddSuccess} />

				{todos.isPending ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<TodoList
						todos={todos.data || []}
						onToggle={handleToggleTodo}
						onDelete={handleDeleteTodo}
						isLoading={isLoading}
					/>
				)}
			</div>
		</div>
	);
}
