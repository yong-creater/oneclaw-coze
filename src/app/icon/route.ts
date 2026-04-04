import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Favicon - 浏览器标签页图标 (使用小龙虾图片)
export async function GET() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'lobster-logo.png');
    const imageBuffer = await readFile(logoPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Favicon] 读取 lobster-logo.png 失败:', error);
    
    // 降级方案：返回预编码的 PNG favicon（红橙渐变 + 🦞）
    const faviconBase64 = `iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGfSURBVFiF7ZaxTsMwEIa/WRsQJShFOnUdrgAFJdiBC3AHzsANsAMdoQqUoOIqVATBS0AULtwEZOAlIGAnYGwmJtFxOxmNDxaXTHKvS2K/9Pz+rLK5CIIgCIKwCmwBXm9v7zUWiwVQVdUJQFVVJ0BVVWfAdrzewRiG0Z6eng5gAH6AB+D19fWDJEmKgRkIy+3t7SOzLPsKkCQJOI4DzrjsUmkAWZbR0tIS1q5dY0B9RwGY3HcAgwHs7++zRqOB4XBI0WyGKEoJ4Pj4WAGwLCua1IBrKKrgWyQJOI5Dd3c3hoeHHQE8Pz8DODw8BEEQeAGcnp4CYFkWfX19qK+vx/PzM57n4TgObrcbgiBAEATs9nq9AoahXq8TgEqlAoDVasUwDFhWFSRJAllWzKZC7HK5ApZlRU5Ebm5OATAzMzMJYGFhYbVhGGa7sLAwCmBpaWkVwNjY2FoA27bNYgCYmprqBHAgqAGX2XgA9gD8AH4ANoB94QHoUa8DRwAAAFs6r+EqE92fAAAAAElFTkSuQmCC`;

    const buffer = Buffer.from(faviconBase64, 'base64');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }
}
