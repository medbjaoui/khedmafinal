import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Trash2, Upload, Eye, History, Compare, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { uploadCV, deleteCV, downloadCV, setActiveCV } from '../../store/slices/cvSlice';
import { CVUpload } from './CVUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
export const CVManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cvs, loading, error, activeCV } = useAppSelector(state => state.cv);
  const { user } = useAppSelector(state => state.auth);
  const [showUpload, setShowUpload] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedCVs, setSelectedCVs] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);