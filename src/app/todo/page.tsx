import React from 'react';
import { TodoPageView } from '@/components/todo/TodoPageView';

export const metadata = {
  title: 'To Do — AirSend',
  description: 'Manage tasks and daily priorities with AirSend To Do.',
};

export default function TodoPage() {
  return <TodoPageView />;
}
