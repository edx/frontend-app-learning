import React from 'react';

import { PluginSlot } from '@openedx/frontend-plugin-framework';
import AccessLock from '../../courseware/course/sequence/AccessLock';


export const AccessLockContentMessageSlot = ({
  courseId,
} : AccessLockContentMessageSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.learning.access_lock_content_message.v1"
    idAliases={['access_lock_content_message_slot']}
    pluginProps={{
      courseId,
    }}
  >
    <AccessLock courseId={courseId} />
  </PluginSlot>
);

interface AccessLockContentMessageSlotProps {
  courseId: string;
}
