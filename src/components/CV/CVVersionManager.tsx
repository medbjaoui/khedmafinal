
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, Star, Compare, Download, Eye, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';

interface CVVersion {
  id: string;
  name: string;
  fileName: string;
  version: string;
  uploadDate: string;
  fileSize: number;
  isActive: boolean;
  isStarred: boolean;
  analysisScore?: number;
  tags: string[];
}

export const CVVersionManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cvVersions, loading } = useAppSelector(state => state.cv);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSetActive = (versionId: string) => {
    dispatch(setActiveCV(versionId));
  };

  const handleToggleStar = (versionId: string) => {
    // Implement star/unstar functionality
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setShowComparison(true);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Versions de CV</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCompare}
            disabled={selectedVersions.length !== 2}
          >
            <Compare className="w-4 h-4 mr-2" />
            Comparer ({selectedVersions.length}/2)
          </Button>
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-3">
          {cvVersions.map((version: CVVersion) => (
            <Card key={version.id} className={`border-2 ${
              version.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
            } ${selectedVersions.includes(version.id) ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleVersionSelect(version.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{version.name}</h3>
                      <p className="text-sm text-gray-600">{version.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">v{version.version}</Badge>
                        {version.isActive && (
                          <Badge variant="default">
                            <Star className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        )}
                        {version.analysisScore && (
                          <Badge variant="outline">
                            Score: {version.analysisScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDate(version.uploadDate)}</p>
                      <p>{formatFileSize(version.fileSize)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStar(version.id)}
                      >
                        <Star className={`w-4 h-4 ${version.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      {!version.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetActive(version.id)}
                        >
                          <Star className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {version.tags.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {version.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {showComparison && (
        <Dialog open={showComparison} onOpenChange={setShowComparison}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Comparaison des versions CV</DialogTitle>
            </DialogHeader>
            <CVComparisonView versions={selectedVersions} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const CVComparisonView: React.FC<{ versions: string[] }> = ({ versions }) => {
  // Implement CV comparison logic here
  return (
    <div className="grid grid-cols-2 gap-4">
      {versions.map((versionId, index) => (
        <div key={versionId} className="space-y-4">
          <h3 className="font-medium">Version {index + 1}</h3>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Aperçu et analyse comparative seront affichés ici
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
