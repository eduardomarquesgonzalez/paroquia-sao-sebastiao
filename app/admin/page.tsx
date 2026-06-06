"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Calendar, Heart } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEvents: 0,
    totalDonations: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    setStats({
      totalPosts: 45,
      totalEvents: 12,
      totalDonations: 8500,
      totalUsers: 8,
    });
  }, []);

  const visitorsData = [
    { month: "Jan", visitors: 1200 },
    { month: "Fev", visitors: 1900 },
    { month: "Mar", visitors: 1500 },
    { month: "Abr", visitors: 2100 },
    { month: "Mai", visitors: 2400 },
    { month: "Jun", visitors: 2800 },
  ];

  const donationsData = [
    { month: "Jan", amount: 3500 },
    { month: "Fev", amount: 4200 },
    { month: "Mar", amount: 3800 },
    { month: "Abr", amount: 5100 },
    { month: "Mai", amount: 4800 },
    { month: "Jun", amount: 5500 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Posts</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalPosts}
              </p>
              <p className="text-sm text-green-600 mt-2">↑ 12% este mês</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-8 h-8 text-parish-blue" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Eventos Ativos</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
              <p className="text-sm text-green-600 mt-2">↑ 8% este mês</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Doações (mês)</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {stats.totalDonations.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2">↑ 15% este mês</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usuários</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-gray-600 mt-2">→ Sem mudanças</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Visitantes do Site
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="#1e40af"
                strokeWidth={2}
                name="Visitantes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Doações Mensais
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donationsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#1e40af" name="Doações (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Atividades Recentes
        </h2>
        <div className="space-y-4">
          {[
            {
              type: "post",
              title: "Nova publicação: Festa de São Sebastião 2025",
              time: "há 2 horas",
            },
            {
              type: "event",
              title: "Evento criado: Missa de Ação de Graças",
              time: "há 5 horas",
            },
            {
              type: "donation",
              title: "Nova doação recebida: R$ 150,00",
              time: "há 1 dia",
            },
            {
              type: "user",
              title: "Novo usuário cadastrado: João Silva",
              time: "há 2 dias",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 pb-4 border-b last:border-0"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === "post"
                    ? "bg-blue-500"
                    : activity.type === "event"
                    ? "bg-purple-500"
                    : activity.type === "donation"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
