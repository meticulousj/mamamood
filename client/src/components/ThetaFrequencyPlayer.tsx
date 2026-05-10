import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Volume2, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function ThetaFrequencyPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [frequency, setFrequency] = useState(6);
  const [volume, setVolume] = useState(30);
  const [enabled, setEnabled] = useState(true);

  const getThetaSettings = trpc.theta.getThetaSettings.useQuery();
  const updateThetaSettings = trpc.theta.updateThetaSettings.useMutation();

  useEffect(() => {
    if (getThetaSettings.data) {
      setFrequency(Number(getThetaSettings.data.preferredFrequency));
      setVolume(getThetaSettings.data.thetaVolume);
      setEnabled(getThetaSettings.data.enableTheta);
    }
  }, [getThetaSettings.data]);

  const handleFrequencyChange = async (value: number[]) => {
    const newFreq = value[0];
    setFrequency(newFreq);
    
    try {
      await updateThetaSettings.mutateAsync({
        preferredFrequency: newFreq,
      });
      toast.success(`Theta frequency set to ${newFreq} Hz`);
    } catch (error) {
      toast.error('Failed to update frequency');
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    try {
      await updateThetaSettings.mutateAsync({
        thetaVolume: newVolume,
      });
    } catch (error) {
      toast.error('Failed to update volume');
    }
  };

  const handleToggleTheta = async (checked: boolean) => {
    setEnabled(checked);
    
    try {
      await updateThetaSettings.mutateAsync({
        enableTheta: checked,
      });
      toast.success(checked ? 'Theta frequencies enabled' : 'Theta frequencies disabled');
    } catch (error) {
      toast.error('Failed to update theta settings');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 right-6 z-40"
    >
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="w-72 p-6 bg-gradient-to-br from-rose-50 to-purple-50 border-rose-200 shadow-lg">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-800">Theta Frequencies</h3>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={handleToggleTheta}
                  disabled={updateThetaSettings.isPending}
                />
              </div>

              {enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Frequency: {frequency} Hz
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      {frequency <= 5 ? 'Deep relaxation & sleep' : frequency <= 6.5 ? 'Meditation & calm' : 'Light relaxation'}
                    </p>
                    <Slider
                      value={[frequency]}
                      onValueChange={handleFrequencyChange}
                      min={4}
                      max={8}
                      step={0.5}
                      disabled={updateThetaSettings.isPending}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4" />
                      Volume: {volume}%
                    </label>
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      min={0}
                      max={100}
                      step={5}
                      disabled={updateThetaSettings.isPending}
                      className="w-full"
                    />
                  </div>

                  <div className="bg-white bg-opacity-50 rounded-lg p-3 text-xs text-gray-700">
                    <p className="font-semibold mb-1">💡 Theta Wave Benefits:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Deeper meditation states</li>
                      <li>• Improved sleep quality</li>
                      <li>• Enhanced relaxation</li>
                      <li>• Reduced stress & anxiety</li>
                    </ul>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
          enabled
            ? 'bg-gradient-to-br from-purple-500 to-rose-500 text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        <Zap className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
