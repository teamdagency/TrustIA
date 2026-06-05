'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Star, Mail, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const stats = [
  {
    title: 'Total des avis',
    value: '1,247',
    change: '+12.5%',
    trend: 'up',
    icon: Star,
  },
  {
    title: 'Campagnes actives',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Mail,
  },
  {
    title: 'Clients',
    value: '3,589',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
  },
  {
    title: 'Note moyenne',
    value: '4.6',
    change: '+0.2',
    trend: 'up',
    icon: TrendingUp,
  },
];

const recentReviews = [
  {
    id: '1',
    author: 'Marie D.',
    rating: 5,
    content: 'Excellent service, je recommande vivement !',
    source: 'Google',
    date: 'Il y a 2h',
  },
  {
    id: '2',
    author: 'Thomas L.',
    rating: 4,
    content: 'Tres bon produit, livraison un peu longue.',
    source: 'Facebook',
    date: 'Il y a 5h',
  },
  {
    id: '3',
    author: 'Sophie M.',
    rating: 5,
    content: 'Parfait ! Rapport qualite-prix imbattable.',
    source: 'Interne',
    date: 'Il y a 1j',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Bonjour, {firstName} !</h1>
        <p className="text-muted-foreground mt-1">
          Voici un apercu de votre activite
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-success mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">vs mois dernier</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-4"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Avis recents</CardTitle>
                  <CardDescription>
                    Les derniers avis de vos clients
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.author}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`w-3 h-3 ${
                                j < review.rating
                                  ? 'text-accent fill-current'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {review.source}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {review.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Gerez votre reputation en quelques clics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Nouvelle campagne
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Ajouter des clients
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Demander un avis
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Voir les analytics
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
