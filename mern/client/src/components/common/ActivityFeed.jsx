import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const getActivityIcon = (type) => {
  switch (type) {
    case 'LIKE':
      return '👍';
    case 'DISLIKE':
      return '👎';
    case 'COMMENT':
    case 'REPLY':
      return '💬';
    case 'REPORT_CREATE':
      return '📋';
    case 'CLAIM_CREATE':
      return '✍️';
    case 'BOOKMARK_CREATE':
      return '🔖';
    case 'PROFILE_UPDATE':
      return '👤';
    default:
      return '🔔';
  }
};

const getActivityText = (activity) => {
  const { type, targetType, target } = activity;
  
  switch (type) {
    case 'LIKE':
      return `liked a ${targetType.toLowerCase()}`;
    case 'DISLIKE':
      return `disliked a ${targetType.toLowerCase()}`;
    case 'COMMENT':
      return 'commented on';
    case 'REPLY':
      return 'replied to a comment on';
    case 'REPORT_CREATE':
      return 'created a report';
    case 'CLAIM_CREATE':
      return 'made a claim';
    case 'BOOKMARK_CREATE':
      return 'bookmarked a';
    case 'PROFILE_UPDATE':
      return 'updated their profile';
    default:
      return 'performed an action';
  }
};

const getActivityLink = (activity) => {
  const { targetType, target } = activity;
  
  switch (targetType) {
    case 'REPORT':
      return `/reports/${target._id}`;
    case 'CLAIM':
      return `/claims/${target._id}`;
    case 'COMMENT':
      // Assuming comments are linked to either reports or claims
      return target.parentType === 'Report' 
        ? `/reports/${target.parent}` 
        : `/claims/${target.parent}`;
    case 'USER':
      return `/profile/${target._id}`;
    case 'BOOKMARK':
      return `/bookmarks/${target._id}`;
    default:
      return '#';
  }
};

const ActivityItem = ({ activity }) => {
  const icon = getActivityIcon(activity.type);
  const text = getActivityText(activity);
  const link = getActivityLink(activity);
  const time = format(new Date(activity.createdAt), 'h:mm a');
  
  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">
          {icon}
        </div>
      </div>
      <div className="flex-grow min-w-0">
        <div className="text-sm">
          <Link to={link} className="font-medium text-gray-900 hover:text-blue-600">
            {text}
          </Link>
          {activity.target && activity.target.title && (
            <span className="ml-1 text-gray-500">
              "{activity.target.title}"
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );
};

const ActivityFeed = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-4">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities to show
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.createdAt), 'MMMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="divide-y divide-gray-200">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className="space-y-2">
          <h3 className="px-4 py-3 text-lg font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
            {date}
          </h3>
          <div className="divide-y divide-gray-100">
            {dateActivities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
